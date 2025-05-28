import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { AddTodoFormSchema } from '@/schemas/todos.schema';
import {
  addTodoFormSchema,
  type CreateTodoInputSchema,
} from '@/schemas/todos.schema';
import type { OmitTyped } from '@/types/omit';
import { formatToReadableDate } from '@/utils/client-date.util';
import { zodResolver } from '@hookform/resolvers/zod';
import { TodoCategory, TodoPriority, TodoStatus } from '@prisma/client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface AddTodoDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (
    todoData: OmitTyped<CreateTodoInputSchema, 'clientTimezone' | 'date'>
  ) => Promise<void>;
  selectedDate: Date;
  isSubmitting?: boolean;
}

const initialFormState: AddTodoFormSchema = {
  title: '',
  description: '',
  timeOfDay: '',
  duration: '',
  priority: TodoPriority.MEDIUM,
  category: TodoCategory.STUDY,
  status: TodoStatus.PENDING,
};

export function AddTodoDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  selectedDate,
  isSubmitting,
}: AddTodoDialogProps) {
  const form = useForm<AddTodoFormSchema>({
    resolver: zodResolver(addTodoFormSchema),
    defaultValues: initialFormState,
    mode: 'onChange',
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(initialFormState);
    }
  }, [form, isOpen]);

  const handleSubmit = (formData: AddTodoFormSchema) => {
    let timeOfDay: { hours: number; minutes: number } | undefined = undefined;
    if (formData.timeOfDay !== '') {
      const [hoursStr, minutesStr] = formData.timeOfDay.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      timeOfDay = { hours, minutes };
    }

    onSubmit({
      ...formData,
      description:
        formData.description === '' ? undefined : formData.description,
      duration: formData.duration ? parseInt(formData.duration, 10) : undefined,
      timeOfDay,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Fill in the details for your new task for{' '}
            {formatToReadableDate(selectedDate)}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min={0} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value as TodoPriority)
                        }
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TodoPriority).map((p) => (
                            <SelectItem key={p} value={p}>
                              {p.charAt(0) + p.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value as TodoCategory)
                        }
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TodoCategory).map((c) => (
                            <SelectItem key={c} value={c}>
                              {c.charAt(0) + c.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(value as TodoStatus)
                        }
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(TodoStatus).map((s) => (
                            <SelectItem key={s} value={s}>
                              {s.charAt(0) + s.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
