"use client"

import * as React from "react"
import { format, addDays, addMonths, parseISO, isValid, startOfDay } from "date-fns"
import {
  ArrowDown as ArrowDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ArrowUp as ArrowUpIcon,
  Bell as BellIcon,
  Building as BuildingIcon,
  Calendar as CalendarIcon,
  Check as CheckIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  ChevronsUpDown as ChevronsUpDownIcon,
  Circle as CircleIcon,
  Clock as ClockIcon,
  Copy as CopyIcon,
  CreditCard as CreditCardIcon,
  Download as DownloadIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Filter as FilterIcon,
  Globe as GlobeIcon,
  Heart as HeartIcon,
  Home as HomeIcon,
  Loader2 as Loader2Icon,
  Lock as LockIcon,
  Mail as MailIcon,
  MapPin as MapPinIcon,
  Minus as MinusIcon,
  Moon as MoonIcon,
  MoreHorizontal as MoreHorizontalIcon,
  MoreVertical as MoreVerticalIcon,
  Pencil as PencilIcon,
  Phone as PhoneIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  SlidersHorizontal as SlidersHorizontalIcon,
  Star as StarIcon,
  Sun as SunIcon,
  Trash as TrashIcon,
  Upload as UploadIcon,
  User as UserIcon,
  X as XIcon,
} from "lucide-react"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/cn-ui/alert-dialog"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/cn-ui/avatar"
import { Badge } from "@/components/cn-ui/badge"
import { Button, buttonVariants } from "@/components/cn-ui/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/cn-ui/button-group"
import { Calendar, CalendarDayButton } from "@/components/cn-ui/calendar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/cn-ui/card"
import { Checkbox } from "@/components/cn-ui/checkbox"
import { DatePicker } from "@/components/cn-ui/date-picker"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/cn-ui/drawer"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/cn-ui/dropdown-menu"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/cn-ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/cn-ui/input-group"
import { Input } from "@/components/cn-ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/cn-ui/item"
import { Label } from "@/components/cn-ui/label"
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/cn-ui/native-select"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/cn-ui/popover"
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@/components/cn-ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/cn-ui/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/cn-ui/select"
import { Separator } from "@/components/cn-ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/cn-ui/sidebar"
import { Slider } from "@/components/cn-ui/slider"
import { Switch } from "@/components/cn-ui/switch"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/cn-ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/cn-ui/tabs"
import { Textarea } from "@/components/cn-ui/textarea"
import { Toggle } from "@/components/cn-ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/cn-ui/toggle-group"
import type { PreviewLayout } from "@/lib/generated-preview/infer-layout"
import { cn } from "@/lib/utils"

/**
 * Layout chosen for the current preview, from `inferPreviewLayout`.
 *
 * Passed by the renderer rather than written into the generated markup: when
 * the model picked — via a class, a prop, or a prompt rule — the same request
 * rendered differently run to run.
 */
const PreviewLayoutContext = React.createContext<PreviewLayout>("single")

export function PreviewLayoutProvider({
  layout,
  children,
}: {
  layout: PreviewLayout
  children: React.ReactNode
}) {
  return (
    <PreviewLayoutContext.Provider value={layout}>
      {children}
    </PreviewLayoutContext.Provider>
  )
}

/** Markup per layout. These want different things, so they get different rules. */
const LAYOUT_CLASSES: Record<PreviewLayout, string> = {
  // One component, centred in the canvas.
  single: "flex min-h-svh items-center justify-center p-6",
  // Many items of a kind. Wraps into rows and reads from the left: centred
  // content that overflows spills off both edges at once and neither end can
  // be reached. `[&>*]` covers the row the generated markup nests inside.
  gallery:
    "flex min-h-svh flex-wrap content-center justify-start gap-3 p-6 [&>*]:max-w-full [&>*]:flex-wrap [&>*]:content-center [&>*]:justify-start [&>*]:gap-3",
  // A whole screen — sidebar layouts, dashboards, login pages. Fills the
  // canvas edge to edge, so no centring and no padding of our own.
  page: "block min-h-svh w-full",
  // A column of items, centred as a block.
  stack:
    "flex min-h-svh flex-col items-center justify-center gap-3 p-6 [&>*]:max-w-full",
}

/**
 * Canvas for a generated preview. The layout comes from the context above, so
 * a `PreviewFrame` in generated code needs no props — `layout` is only there
 * for a caller that genuinely wants to override the inference.
 */
function PreviewFrame({
  children,
  layout,
  className,
}: {
  children: React.ReactNode
  layout?: PreviewLayout
  className?: string
}) {
  const inferred = React.useContext(PreviewLayoutContext)
  const resolved = layout ?? inferred

  return (
    <div
      className={cn(
        "bg-background text-foreground",
        LAYOUT_CLASSES[resolved],
        className
      )}
    >
      {children}
    </div>
  )
}

export const GENERATED_PREVIEW_SCOPE: Record<string, unknown> = {
  cn,
  format,
  addDays,
  addMonths,
  parseISO,
  isValid,
  startOfDay,
  PreviewFrame,
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
  Badge,
  Button,
  buttonVariants,
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  Calendar,
  CalendarDayButton,
  CalendarIcon,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  Checkbox,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  DatePicker,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
  Label,
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
  RadioGroup,
  RadioGroupItem,
  ScrollArea,
  ScrollBar,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  Skeleton,
  Slider,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  BellIcon,
  BuildingIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  ChevronsUpDownIcon,
  CircleIcon,
  ClockIcon,
  CopyIcon,
  CreditCardIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  FilterIcon,
  GlobeIcon,
  HeartIcon,
  HomeIcon,
  Loader2Icon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  MinusIcon,
  MoonIcon,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  SlidersHorizontalIcon,
  StarIcon,
  SunIcon,
  TrashIcon,
  UploadIcon,
  UserIcon,
  XIcon,
}
