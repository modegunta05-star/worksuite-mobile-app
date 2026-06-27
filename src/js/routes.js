import NotFoundPage from '@/pages/404.vue';

import SelfProjects from '@/pages/projects/index-self.vue';
import Projects from '@/pages/projects/index.vue';
import ProjectShow from '@/pages/projects/show.vue';
import ProjectCreate from '@/pages/projects/create.vue';
import ProjectEdit from '@/pages/projects/edit.vue';

import ClientIndex from '@/pages/client/index.vue';
import ClientCreate from '@/pages/client/create.vue';
import ClientShow from '@/pages/client/show.vue';

import Leads from '@/pages/lead/index.vue';

import Employee from '@/pages/employee/index.vue';
import EmployeeShow from '@/pages/employee/show.vue';
import EmployeeCreate from '@/pages/employee/create.vue';
import EmployeeEdit from '@/pages/employee/edit.vue';

import Expense from '@/pages/expense/index.vue';
import ExpenseShow from '@/pages/expense/show.vue';
import ExpenseCreate from '@/pages/expense/create.vue';
import ExpenseEdit from '@/pages/expense/edit.vue';

import Attendance from '@/pages/attendance/index.vue';

import Leave from '@/pages/leave/index.vue';
import LeaveShow from '@/pages/leave/show.vue';
import LeaveCreate from '@/pages/leave/create.vue';
import LeaveEdit from '@/pages/leave/edit.vue';

import SelfTasks from '@/pages/tasks/index-self.vue';
import Tasks from '@/pages/tasks/index.vue';
import TasksShow from '@/pages/tasks/show.vue';
import TaskCreate from '@/pages/tasks/create.vue';
import TaskEdit from '@/pages/tasks/edit.vue';

import NoticeIndex from '@/pages/noticeboard/index.vue';
import NoticeShow from '@/pages/noticeboard/show.vue';

import TicketIndex from '@/pages/ticket/index.vue';
import TicketShow from '@/pages/ticket/show.vue';
import TicketCreate from '@/pages/ticket/create.vue';

import EstimateIndex from '@/pages/estimates/index.vue';
import EstimateShow from '@/pages/estimates/show.vue';

import InvoiceIndex from '@/pages/invoices/index.vue';
import InvoiceShow from '@/pages/invoices/show.vue';

import Calendar from '@/pages/event/calendar.vue';
import EventShow from '@/pages/event/show.vue';

import Dashboard from '@/pages/dashboard.vue';

import About from '@/pages/about.vue';

const routes = [
    {
        path: '/self/dashboard',
        name: 'dashboard',
        component: Dashboard,
    },
    {
        path: '/',
        name: 'dashboard',
        component: Dashboard,
    },
    {
        path: '/about/',
        name: 'about',
        component: About,
    },
    {
        path: '/projects/:from?',
        name: 'projects',
        component: Projects,
    },
    {
        path: '/project/create',
        name: 'projects.create',
        component: ProjectCreate,
    },
    {
        path: '/project/:id/tasks',
        name: 'projects.tasks',
        component: Tasks,
    },
    {
        path: '/project/:id/edit',
        name: 'projects.edit',
        component: ProjectEdit,
    },
    {
        path: '/project/:id',
        name: 'projects.show',
        component: ProjectShow,
    },
    {
        path: '/self/projects/:from?', // :from is added so we can show back button when moved from dashbaord
        name: 'projects.self',
        component: SelfProjects,
    },
    {
        path: '/self/project/:id',
        name: 'projects.show',
        component: ProjectShow,
    },
    {
        path: '/clients',
        name: 'clients',
        component: ClientIndex,
    },
    {
        path: '/client/create',
        name: 'client.create',
        component: ClientCreate,
    },
    {
        path: '/client/:id',
        name: 'client.show',
        component: ClientShow,
    },
    {
        path: '/leads',
        name: 'leads',
        component: Leads,
    },
    {
        path: '/employees',
        name: 'employee',
        component: Employee,
    },
    {
        path: '/employee/create',
        name: 'employee.create',
        component: EmployeeCreate,
    },
    {
        path: '/employee/:id/edit',
        name: 'employee.edit',
        component: EmployeeEdit,
    },
    {
        path: '/employee/:id',
        name: 'employee.show',
        component: EmployeeShow,
    },
    {
        path: '/leaves',
        name: 'leave',
        component: Leave,
    },
    {
        path: '/leave/create',
        name: 'leave.create',
        component: LeaveCreate,
    },
    {
        path: '/leave/:id/edit',
        name: 'leave.edit',
        component: LeaveEdit,
    },
    {
        path: '/leave/:id',
        name: 'leave.show',
        component: LeaveShow,
    },
    {
        path: '/self/leaves',
        name: 'leave',
        component: Leave,
    },
    {
        path: '/self/leave/create',
        name: 'leave.create',
        component: LeaveCreate,
    },
    {
        path: '/self/leave/:id/edit',
        name: 'leave.edit',
        component: LeaveEdit,
    },
    {
        path: '/self/leave/:id',
        name: 'leave.show',
        component: LeaveShow,
    },
    {
        path: '/expenses',
        name: 'expense',
        component: Expense,
    },
    {
        path: '/expense/create',
        name: 'expense.create',
        component: ExpenseCreate,
    },
    {
        path: '/expense/:id/edit',
        name: 'expense.edit',
        component: ExpenseEdit,
    },
    {
        path: '/expense/:id',
        name: 'expense.show',
        component: ExpenseShow,
    },
    {
        path: '/self/expenses',
        name: 'expense',
        component: Expense,
    },
    {
        path: '/self/expense/create',
        name: 'expense.create',
        component: ExpenseCreate,
    },
    {
        path: '/self/expense/:id/edit',
        name: 'expense.edit',
        component: ExpenseEdit,
    },
    {
        path: '/self/expense/:id',
        name: 'expense.show',
        component: ExpenseShow,
    },
    {
        path: '/tasks/:from?', // :from is added so we can show back button when moved from dashbaord
        name: 'tasks',
        component: Tasks,
    },
    {
        path: '/task/create',
        name: 'task.create',
        component: TaskCreate,
    },
    {
        path: '/task/:id',
        name: 'task.show',
        component: TasksShow,
    },
    {
        path: '/task/:id/edit',
        name: 'task.edit',
        component: TaskEdit,
    },
    {
        path: '/self/tasks/:from?', // :from is added so we can show back button when moved from dashbaord
        name: 'tasks.self',
        component: SelfTasks,
    },
    {
        path: '/self/task/create',
        name: 'task.create',
        component: TaskCreate,
    },
    {
        path: '/self/task/:id',
        name: 'task.show',
        component: TasksShow,
    },
    {
        path: '/self/task/:id/edit',
        name: 'task.edit',
        component: TaskEdit,
    },
    {
        path: '/notice',
        name: 'notice',
        component: NoticeIndex,
    },
    {
        path: '/notice/:id',
        name: 'notice.show',
        component: NoticeShow,

    },
    {
        path: '/self/notice',
        name: 'notice',
        component: NoticeIndex,
    },
    {
        path: '/self/notice/:id',
        name: 'notice.show',
        component: NoticeShow,
    },
    {
        path: '/estimates',
        name: 'estimates',
        component: EstimateIndex,
    },
    {
        path: '/estimate/:id',
        name: 'estimate.show',
        component: EstimateShow,
    },
    {
        path: '/invoices/:from?', // :from is added so we can show back button when moved from dashbaord
        name: 'invoices',
        component: InvoiceIndex,
    },
    {
        path: '/invoice/:id',
        name: 'invoice.show',
        component: InvoiceShow,
    },
    {
        path: '/calendar',
        name: 'calendar',
        component: Calendar,
    },
    {
        path: '/event/:id',
        name: 'event.show',
        component: EventShow,
    },
    {
        path: '/attendance/:from?', // :from is added so we can show back button when moved from dashbaord
        name: 'attendance',
        component: Attendance,
    },
    {
        path: '/tickets',
        name: 'tickets',
        component: TicketIndex,
    },
    {
        path: '/ticket/create',
        name: 'ticket.create',
        component: TicketCreate,
    },
    {
        path: '/ticket/:id',
        name: 'ticket.show',
        component: TicketShow,
    },
    {
        path: '(.*)',
        name: '404',
        component: NotFoundPage,
    },
];

export default routes;
