"""
Problem Ingestion Script
========================
Parses the leetcode-companywise-interview-questions folder and inserts problems into PostgreSQL.

Usage:
    python ingest_problems.py --db-url "postgresql://user:pass@localhost:5432/interviewdb"
    
Or with environment variable:
    DATABASE_URL=postgresql://... python ingest_problems.py
"""

import os
import csv
import json
import re
import asyncio
import argparse
from pathlib import Path
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
from datetime import datetime
import hashlib

# For database operations
try:
    import asyncpg
except ImportError:
    print("Installing asyncpg...")
    os.system("pip install asyncpg")
    import asyncpg

@dataclass
class Problem:
    leetcode_id: int
    title: str
    slug: str
    url: str
    difficulty: str
    acceptance_rate: float
    frequency: float
    company_tags: List[str]

@dataclass
class CompanyProblem:
    company_name: str
    company_slug: str
    problem_id: int  # leetcode_id
    frequency: float
    time_period: str

class ProblemIngester:
    def __init__(self, questions_dir: str, db_url: str):
        self.questions_dir = Path(questions_dir)
        self.db_url = db_url
        self.problems: Dict[int, Problem] = {}  # leetcode_id -> Problem
        self.company_problems: List[CompanyProblem] = []
        self.pool = None
        
    def slugify(self, text: str) -> str:
        """Convert text to URL-friendly slug."""
        text = text.lower().strip()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[\s_-]+', '-', text)
        return text.strip('-')
    
    def parse_percentage(self, value: str) -> float:
        """Parse percentage string to float."""
        if not value:
            return 0.0
        return float(value.replace('%', '').strip())
    
    def get_company_name(self, folder_name: str) -> str:
        """Convert folder slug to display name."""
        # Convert slug to title case
        name = folder_name.replace('-', ' ').title()
        
        # Handle special cases
        special_cases = {
            'At T': 'AT&T',
            'F5 Networks': 'F5 Networks',
            'C3 Ai': 'C3.ai',
            'De Shaw': 'D. E. Shaw',
            'Bnp Paribas': 'BNP Paribas',
            'Bny Mellon': 'BNY Mellon',
            'Ey': 'EY',
            'Pwc': 'PwC',
            'Ibm': 'IBM',
            'Jpmorgan': 'JPMorgan',
            'Kpmg': 'KPMG',
            'Hp': 'HP',
            'Hpe': 'HPE',
            'Sap': 'SAP',
            'Vmware': 'VMware',
            'Linkedin': 'LinkedIn',
            'Servicenow': 'ServiceNow',
            'Mongodb': 'MongoDB',
            'Paypal': 'PayPal',
            'Doordash': 'DoorDash',
            'Wework': 'WeWork',
            'Bytedance': 'ByteDance',
            'Tiktok': 'TikTok',
            'Digitalocean': 'DigitalOcean',
        }
        
        return special_cases.get(name, name)
    
    def parse_csv_file(self, csv_path: Path, company_slug: str, time_period: str):
        """Parse a single CSV file and extract problems."""
        company_name = self.get_company_name(company_slug)
        
        try:
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                for row in reader:
                    try:
                        leetcode_id = int(row.get('ID', 0))
                        if leetcode_id == 0:
                            continue
                            
                        title = row.get('Title', '').strip()
                        url = row.get('URL', '').strip()
                        difficulty = row.get('Difficulty', 'Medium').strip()
                        acceptance = self.parse_percentage(row.get('Acceptance %', '0'))
                        frequency = self.parse_percentage(row.get('Frequency %', '0'))
                        
                        # Generate slug from URL or title
                        if url:
                            slug = url.split('/')[-1] if url.endswith('/') else url.split('/')[-1]
                        else:
                            slug = self.slugify(title)
                        
                        # Update or create problem
                        if leetcode_id in self.problems:
                            # Add company tag if not present
                            if company_name not in self.problems[leetcode_id].company_tags:
                                self.problems[leetcode_id].company_tags.append(company_name)
                        else:
                            self.problems[leetcode_id] = Problem(
                                leetcode_id=leetcode_id,
                                title=title,
                                slug=slug,
                                url=url,
                                difficulty=difficulty,
                                acceptance_rate=acceptance,
                                frequency=frequency,
                                company_tags=[company_name]
                            )
                        
                        # Add company-problem relationship
                        self.company_problems.append(CompanyProblem(
                            company_name=company_name,
                            company_slug=company_slug,
                            problem_id=leetcode_id,
                            frequency=frequency,
                            time_period=time_period
                        ))
                        
                    except (ValueError, KeyError) as e:
                        print(f"  Warning: Skipping row in {csv_path}: {e}")
                        continue
                        
        except Exception as e:
            print(f"Error reading {csv_path}: {e}")
    
    def scan_companies(self):
        """Scan all company folders and parse their CSV files."""
        print(f"\n📂 Scanning directory: {self.questions_dir}")
        
        # Time period mappings
        time_periods = {
            'thirty-days.csv': 'thirty_days',
            'three-months.csv': 'three_months',
            'six-months.csv': 'six_months',
            'more-than-six-months.csv': 'more_than_six_months',
            'all.csv': 'all_time'
        }
        
        companies_processed = 0
        
        for company_dir in sorted(self.questions_dir.iterdir()):
            if not company_dir.is_dir():
                continue
                
            company_slug = company_dir.name
            
            # Skip hidden and special directories
            if company_slug.startswith('.') or company_slug in ['node_modules', '__pycache__']:
                continue
            
            csv_files = list(company_dir.glob('*.csv'))
            if not csv_files:
                continue
                
            print(f"  📁 Processing: {company_slug} ({len(csv_files)} files)")
            companies_processed += 1
            
            for csv_file in csv_files:
                time_period = time_periods.get(csv_file.name, 'all_time')
                self.parse_csv_file(csv_file, company_slug, time_period)
        
        print(f"\n✅ Processed {companies_processed} companies")
        print(f"✅ Found {len(self.problems)} unique problems")
        print(f"✅ Found {len(self.company_problems)} company-problem relationships")
    
    async def connect_db(self):
        """Establish database connection pool."""
        print(f"\n🔌 Connecting to database...")
        self.pool = await asyncpg.create_pool(self.db_url, min_size=2, max_size=10)
        print("✅ Database connected")
    
    async def close_db(self):
        """Close database connection pool."""
        if self.pool:
            await self.pool.close()
            print("🔌 Database connection closed")
    
    async def insert_problems(self):
        """Insert problems into the database."""
        print(f"\n📥 Inserting {len(self.problems)} problems...")
        
        async with self.pool.acquire() as conn:
            # Prepare the insert statement
            insert_sql = """
                INSERT INTO problems (
                    leetcode_id, title, slug, url, difficulty, 
                    acceptance_rate, frequency, company_tags, is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
                ON CONFLICT (leetcode_id) DO UPDATE SET
                    title = EXCLUDED.title,
                    url = EXCLUDED.url,
                    difficulty = EXCLUDED.difficulty,
                    acceptance_rate = EXCLUDED.acceptance_rate,
                    frequency = GREATEST(problems.frequency, EXCLUDED.frequency),
                    company_tags = (
                        SELECT ARRAY(
                            SELECT DISTINCT unnest(problems.company_tags || EXCLUDED.company_tags)
                        )
                    ),
                    updated_at = NOW()
                RETURNING id, leetcode_id
            """
            
            inserted = 0
            problem_id_map = {}  # leetcode_id -> uuid
            
            for problem in self.problems.values():
                try:
                    result = await conn.fetchrow(
                        insert_sql,
                        problem.leetcode_id,
                        problem.title,
                        problem.slug,
                        problem.url,
                        problem.difficulty,
                        problem.acceptance_rate,
                        problem.frequency,
                        problem.company_tags
                    )
                    problem_id_map[result['leetcode_id']] = result['id']
                    inserted += 1
                    
                    if inserted % 500 == 0:
                        print(f"  Inserted {inserted} problems...")
                        
                except Exception as e:
                    print(f"  Error inserting problem {problem.leetcode_id}: {e}")
            
            print(f"✅ Inserted/updated {inserted} problems")
            return problem_id_map
    
    async def insert_company_problems(self, problem_id_map: Dict[int, str]):
        """Insert company-problem relationships."""
        print(f"\n📥 Inserting {len(self.company_problems)} company-problem relationships...")
        
        async with self.pool.acquire() as conn:
            insert_sql = """
                INSERT INTO company_problems (
                    company_name, company_slug, problem_id, frequency, time_period
                ) VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (company_slug, problem_id, time_period) DO UPDATE SET
                    frequency = GREATEST(company_problems.frequency, EXCLUDED.frequency),
                    created_at = NOW()
            """
            
            inserted = 0
            skipped = 0
            
            for cp in self.company_problems:
                problem_uuid = problem_id_map.get(cp.problem_id)
                if not problem_uuid:
                    skipped += 1
                    continue
                    
                try:
                    await conn.execute(
                        insert_sql,
                        cp.company_name,
                        cp.company_slug,
                        problem_uuid,
                        cp.frequency,
                        cp.time_period
                    )
                    inserted += 1
                    
                    if inserted % 1000 == 0:
                        print(f"  Inserted {inserted} relationships...")
                        
                except Exception as e:
                    print(f"  Error inserting company-problem: {e}")
            
            print(f"✅ Inserted {inserted} relationships (skipped {skipped})")
    
    async def generate_stats(self):
        """Generate and print statistics."""
        async with self.pool.acquire() as conn:
            # Problem stats
            stats = await conn.fetchrow("""
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE difficulty = 'Easy') as easy,
                    COUNT(*) FILTER (WHERE difficulty = 'Medium') as medium,
                    COUNT(*) FILTER (WHERE difficulty = 'Hard') as hard
                FROM problems
            """)
            
            # Company stats
            company_count = await conn.fetchval(
                "SELECT COUNT(DISTINCT company_slug) FROM company_problems"
            )
            
            # Top companies by problem count
            top_companies = await conn.fetch("""
                SELECT company_name, COUNT(*) as count
                FROM company_problems
                WHERE time_period = 'all_time'
                GROUP BY company_name
                ORDER BY count DESC
                LIMIT 10
            """)
            
            print("\n" + "="*50)
            print("📊 INGESTION STATISTICS")
            print("="*50)
            print(f"\n📝 Total Problems: {stats['total']}")
            print(f"   🟢 Easy: {stats['easy']}")
            print(f"   🟡 Medium: {stats['medium']}")
            print(f"   🔴 Hard: {stats['hard']}")
            print(f"\n🏢 Companies: {company_count}")
            print("\n🏆 Top 10 Companies by Problems:")
            for i, row in enumerate(top_companies, 1):
                print(f"   {i:2}. {row['company_name']}: {row['count']} problems")
    
    async def run(self):
        """Main execution flow."""
        print("\n" + "="*50)
        print("🚀 PROBLEM INGESTION SCRIPT")
        print("="*50)
        
        # Step 1: Scan and parse CSV files
        self.scan_companies()
        
        if not self.problems:
            print("❌ No problems found. Exiting.")
            return
        
        # Step 2: Connect to database
        await self.connect_db()
        
        try:
            # Step 3: Insert problems
            problem_id_map = await self.insert_problems()
            
            # Step 4: Insert company-problem relationships
            await self.insert_company_problems(problem_id_map)
            
            # Step 5: Generate stats
            await self.generate_stats()
            
            print("\n✅ Ingestion complete!")
            
        finally:
            await self.close_db()


def export_to_json(questions_dir: str, output_file: str):
    """Export problems to JSON format (for use without database)."""
    ingester = ProblemIngester(questions_dir, "")
    ingester.scan_companies()
    
    # Convert to JSON-serializable format
    problems_list = []
    for problem in ingester.problems.values():
        problems_list.append({
            'leetcode_id': problem.leetcode_id,
            'title': problem.title,
            'slug': problem.slug,
            'url': problem.url,
            'difficulty': problem.difficulty,
            'acceptance_rate': problem.acceptance_rate,
            'frequency': problem.frequency,
            'company_tags': problem.company_tags
        })
    
    # Sort by leetcode_id
    problems_list.sort(key=lambda x: x['leetcode_id'])
    
    output = {
        'generated_at': datetime.now().isoformat(),
        'total_problems': len(problems_list),
        'problems': problems_list
    }
    
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"\n✅ Exported {len(problems_list)} problems to {output_file}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest LeetCode problems into database")
    parser.add_argument(
        '--questions-dir',
        default='../leetcode-companywise-interview-questions',
        help='Path to the questions directory'
    )
    parser.add_argument(
        '--db-url',
        default=os.environ.get('DATABASE_URL'),
        help='PostgreSQL connection URL'
    )
    parser.add_argument(
        '--export-json',
        help='Export to JSON file instead of database'
    )
    
    args = parser.parse_args()
    
    if args.export_json:
        export_to_json(args.questions_dir, args.export_json)
    else:
        if not args.db_url:
            print("❌ Error: DATABASE_URL environment variable or --db-url argument required")
            print("   Example: --db-url 'postgresql://user:pass@localhost:5432/interviewdb'")
            exit(1)
        
        asyncio.run(ProblemIngester(args.questions_dir, args.db_url).run())
