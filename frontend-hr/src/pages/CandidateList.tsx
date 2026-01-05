import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { 
  Search, 
  Filter, 
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Candidate {
  id: string
  name: string
  email: string
  role: string
  job: string
  status: 'new' | 'screening' | 'interview' | 'passed' | 'failed' | 'hired'
  score: number | null
  appliedAt: string
  avatar?: string
}

const mockCandidates: Candidate[] = [
  { id: '1', name: 'Alex Chen', email: 'alex.chen@email.com', role: 'Senior Frontend Developer', job: 'Frontend Team', status: 'passed', score: 92, appliedAt: '2024-01-18', avatar: undefined },
  { id: '2', name: 'Maria Garcia', email: 'maria.garcia@email.com', role: 'Full Stack Engineer', job: 'Platform Team', status: 'passed', score: 88, appliedAt: '2024-01-17', avatar: undefined },
  { id: '3', name: 'James Wilson', email: 'james.wilson@email.com', role: 'Backend Developer', job: 'API Team', status: 'interview', score: 75, appliedAt: '2024-01-16', avatar: undefined },
  { id: '4', name: 'Emily Brown', email: 'emily.brown@email.com', role: 'DevOps Engineer', job: 'Infrastructure', status: 'screening', score: null, appliedAt: '2024-01-15', avatar: undefined },
  { id: '5', name: 'David Lee', email: 'david.lee@email.com', role: 'Senior Backend Developer', job: 'Backend Team', status: 'new', score: null, appliedAt: '2024-01-14', avatar: undefined },
  { id: '6', name: 'Sarah Kim', email: 'sarah.kim@email.com', role: 'Full Stack Engineer', job: 'Growth Team', status: 'failed', score: 45, appliedAt: '2024-01-13', avatar: undefined },
  { id: '7', name: 'Michael Park', email: 'michael.park@email.com', role: 'Frontend Developer', job: 'Frontend Team', status: 'hired', score: 95, appliedAt: '2024-01-12', avatar: undefined },
  { id: '8', name: 'Lisa Wang', email: 'lisa.wang@email.com', role: 'Backend Developer', job: 'API Team', status: 'interview', score: 82, appliedAt: '2024-01-11', avatar: undefined },
  { id: '9', name: 'John Smith', email: 'john.smith@email.com', role: 'DevOps Engineer', job: 'Infrastructure', status: 'passed', score: 86, appliedAt: '2024-01-10', avatar: undefined },
  { id: '10', name: 'Anna Johnson', email: 'anna.johnson@email.com', role: 'QA Engineer', job: 'Quality Team', status: 'screening', score: null, appliedAt: '2024-01-09', avatar: undefined },
]

function getStatusBadge(status: Candidate['status']) {
  const styles = {
    new: 'bg-slate-100 text-slate-700 border-slate-200',
    screening: 'bg-blue-100 text-blue-700 border-blue-200',
    interview: 'bg-purple-100 text-purple-700 border-purple-200',
    passed: 'bg-green-100 text-green-700 border-green-200',
    failed: 'bg-red-100 text-red-700 border-red-200',
    hired: 'bg-emerald-500 text-white border-emerald-500',
  }
  return <Badge className={styles[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
}

function getStatusIcon(status: Candidate['status']) {
  switch (status) {
    case 'passed':
    case 'hired':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <Clock className="h-4 w-4 text-amber-500" />
  }
}

function getScoreColor(score: number | null) {
  if (score === null) return 'text-slate-400'
  if (score >= 80) return 'text-green-600 font-semibold'
  if (score >= 60) return 'text-amber-600 font-semibold'
  return 'text-red-600 font-semibold'
}

export default function CandidateList() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo<ColumnDef<Candidate>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Candidate
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={row.original.avatar || undefined} />
            <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
              {row.original.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <Link to={`/candidate/${row.original.id}`} className="font-medium text-slate-900 hover:text-blue-600">
              {row.original.name}
            </Link>
            <p className="text-sm text-slate-500">{row.original.email}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Applied For',
      cell: ({ row }) => (
        <div>
          <p className="text-slate-900">{row.original.role}</p>
          <p className="text-sm text-slate-500">{row.original.job}</p>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.original.status)}
          {getStatusBadge(row.original.status)}
        </div>
      ),
    },
    {
      accessorKey: 'score',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Score
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className={getScoreColor(row.original.score)}>
          {row.original.score !== null ? `${row.original.score}%` : '—'}
        </span>
      ),
    },
    {
      accessorKey: 'appliedAt',
      header: 'Applied',
      cell: ({ row }) => (
        <span className="text-slate-500">
          {new Date(row.original.appliedAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/candidate/${row.original.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Report
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Interview
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-green-600">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Passed
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [])

  const table = useReactTable({
    data: mockCandidates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="text-slate-500">Manage and review all applicants</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{mockCandidates.length}</p>
            <p className="text-sm text-slate-500">Total</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{mockCandidates.filter(c => c.status === 'new').length}</p>
            <p className="text-sm text-slate-500">New</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{mockCandidates.filter(c => c.status === 'interview').length}</p>
            <p className="text-sm text-slate-500">In Progress</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{mockCandidates.filter(c => c.status === 'passed' || c.status === 'hired').length}</p>
            <p className="text-sm text-slate-500">Passed</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{mockCandidates.filter(c => c.status === 'failed').length}</p>
            <p className="text-sm text-slate-500">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Search candidates..."
            className="pl-10"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="h-10 px-3 rounded-md border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => table.getColumn('status')?.setFilterValue(e.target.value || undefined)}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="hired">Hired</option>
          </select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-slate-200 bg-slate-50">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())
                      }
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}{' '}
            of {table.getFilteredRowModel().rows.length} candidates
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
