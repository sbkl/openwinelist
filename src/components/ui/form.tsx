import * as React from "react";
import type { AnyFieldMeta } from "@tanstack/react-form";
import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import { format, type Locale } from "date-fns";
import type { ZodError } from "zod";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Camera,
  CalendarIcon,
  Clock3,
  FileAudio2,
  Loader2,
  Lock,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  MarkdownEditor,
  type MarkdownEditorProps,
} from "@/components/ui/markdown-editor";
import { Spinner } from "./spinner";
import { PromptInputSubmit } from "@/components/ui/prompt-input";

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();

interface ErrorFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  meta: AnyFieldMeta;
}

export function ErrorsField({ meta, className, ...props }: ErrorFieldProps) {
  if (!meta.errors.length) return null;
  return (
    <div className={cn(className)} {...props}>
      {meta.errors.map((e: ZodError | string, index) => {
        return (
          <p key={index.toString()} className="mb-1 text-xs text-destructive">
            {typeof e === "string" ? e : e.message}
          </p>
        );
      })}
    </div>
  );
}

export type TagKeyAction = "commit" | "remove-last" | null;

export function getTagKeyAction(
  key: string,
  inputValue: string,
  isComposing = false,
): TagKeyAction {
  if (isComposing) return null;
  if (key === "Enter" || key === ",") return "commit";
  if (key === "Backspace" && inputValue === "") return "remove-last";
  return null;
}

export function appendTag(tags: string[], inputValue: string): string[] {
  const nextTag = inputValue.trim();
  if (!nextTag) return tags;

  const normalizedTag = nextTag.toLocaleLowerCase("en");
  if (
    tags.some((tag) => tag.trim().toLocaleLowerCase("en") === normalizedTag)
  ) {
    return tags;
  }

  return [...tags, nextTag];
}

export function removeTag(tags: string[], index: number): string[] {
  return tags.filter((_, tagIndex) => tagIndex !== index);
}

export interface TagsFieldValue {
  tags: string[];
  input: string;
}

interface TagsFieldProps {
  onTagsChange?: (tags: string[]) => void;
  label?: string;
  description?: string;
  placeholder?: string;
  inputAriaLabel?: string;
  readOnly?: boolean;
  fieldClassName?: string;
  inputGroupClassName?: string;
  inputClassName?: string;
}

function TagsField({
  onTagsChange,
  label,
  description,
  placeholder = "Add a tag…",
  inputAriaLabel = "Add tag",
  readOnly = false,
  fieldClassName,
  inputGroupClassName,
  inputClassName,
}: TagsFieldProps) {
  const field = useFieldContext<TagsFieldValue>();
  const hasErrors = field.state.meta.errors.length > 0;
  const { tags, input } = field.state.value;

  function commitInput() {
    const nextTags = appendTag(tags, input);
    field.handleChange({ tags: nextTags, input: "" });
    if (nextTags !== tags) onTagsChange?.(nextTags);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const action = getTagKeyAction(
      event.key,
      input,
      event.nativeEvent.isComposing,
    );
    if (action === "commit") {
      event.preventDefault();
      commitInput();
      return;
    }

    if (action === "remove-last" && tags.length > 0) {
      event.preventDefault();
      const nextTags = tags.slice(0, -1);
      field.handleChange({ tags: nextTags, input });
      onTagsChange?.(nextTags);
    }
  }

  return (
    <Field
      data-invalid={hasErrors ? true : undefined}
      className={fieldClassName}
    >
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <InputGroup
        className={cn(
          "h-auto min-h-8 flex-wrap gap-1 px-2 py-1",
          inputGroupClassName,
        )}
      >
        {tags.length > 0 ? (
          <InputGroupAddon className="flex min-w-0 flex-wrap gap-1 p-0">
            {tags.map((tag, index) => (
              <Badge
                key={`${tag}-${index.toString()}`}
                variant="secondary"
                className={cn(
                  "group-focus-within/input-group:border-border/60 group-focus-within/input-group:bg-background group-focus-within/input-group:text-foreground",
                  readOnly ? "pr-2.5" : "gap-0.5 pr-0.5",
                )}
              >
                <span>{tag}</span>
                {!readOnly ? (
                  <InputGroupButton
                    size="icon-xs"
                    aria-label={`Remove tag: ${tag}`}
                    onClick={() => {
                      const nextTags = removeTag(tags, index);
                      field.handleChange({ tags: nextTags, input });
                      onTagsChange?.(nextTags);
                    }}
                  >
                    <X aria-hidden="true" />
                  </InputGroupButton>
                ) : null}
              </Badge>
            ))}
          </InputGroupAddon>
        ) : null}
        {!readOnly ? (
          <InputGroupInput
            id={field.name}
            name={field.name}
            type="text"
            autoComplete="off"
            aria-label={inputAriaLabel}
            aria-invalid={hasErrors ? true : undefined}
            placeholder={placeholder}
            value={input}
            onChange={(event) =>
              field.handleChange({ tags, input: event.currentTarget.value })
            }
            onKeyDown={handleKeyDown}
            className={cn("min-w-24 flex-1 px-0 text-sm", inputClassName)}
          />
        ) : null}
      </InputGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

export interface AsyncTagSelectOption {
  value: string;
  label: string;
  description?: string;
  unavailable?: boolean;
}

export interface AsyncTagSelectFieldProps {
  options: readonly AsyncTagSelectOption[];
  selectedOptions?: readonly AsyncTagSelectOption[];
  onQueryChange?: (query: string) => void;
  onValueChange?: (values: string[]) => void;
  placeholder?: string;
  inputAriaLabel?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  error?: string | null;
  loading?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  shouldFilter?: boolean;
  queryDebounceMs?: number;
  fieldClassName?: string;
  inputGroupClassName?: string;
  popoverClassName?: string;
}

function AsyncTagSelectField({
  options,
  selectedOptions = [],
  onQueryChange,
  onValueChange,
  placeholder = "Search options…",
  inputAriaLabel = "Search options",
  emptyMessage = "No options found.",
  loadingMessage = "Loading options…",
  error,
  loading = false,
  disabled = false,
  readOnly = false,
  shouldFilter = true,
  queryDebounceMs = 200,
  fieldClassName,
  inputGroupClassName,
  popoverClassName,
}: AsyncTagSelectFieldProps) {
  const field = useFieldContext<string[]>();
  const selectedValues = field.state.value;
  const hasErrors = field.state.meta.errors.length > 0;
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const controlRef = React.useRef<HTMLDivElement | null>(null);
  const optionsRef = React.useRef<HTMLDivElement | null>(null);
  const isDisabled = disabled || readOnly;

  const optionByValue = new Map<string, AsyncTagSelectOption>();
  for (const option of selectedOptions) optionByValue.set(option.value, option);
  for (const option of options) optionByValue.set(option.value, option);

  const selectedValueSet = new Set(selectedValues);
  const availableOptions = options.filter(
    (option, index) =>
      !selectedValueSet.has(option.value) &&
      options.findIndex((candidate) => candidate.value === option.value) ===
        index,
  );

  React.useEffect(() => {
    if (!onQueryChange) return;
    const timeout = window.setTimeout(
      () => onQueryChange(query),
      queryDebounceMs,
    );
    return () => window.clearTimeout(timeout);
  }, [onQueryChange, query, queryDebounceMs]);

  function updateValue(nextValues: string[]) {
    const uniqueValues = [...new Set(nextValues)];
    field.handleChange(uniqueValues);
    onValueChange?.(uniqueValues);
  }

  function updateQuery(nextQuery: string) {
    setQuery(nextQuery);
  }

  function refocusInput() {
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  React.useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (
        controlRef.current?.contains(target) ||
        optionsRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  return (
    <Field
      data-invalid={hasErrors ? true : undefined}
      className={fieldClassName}
    >
      <Command
        shouldFilter={shouldFilter}
        className="relative overflow-visible rounded-none bg-transparent p-0"
      >
        <div
          ref={controlRef}
          data-slot="async-tag-select-control"
          className={cn(
            "group/input-group flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-input bg-background/70 px-2 py-1 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
            hasErrors &&
              "border-destructive ring-destructive/20 dark:ring-destructive/40",
            isDisabled && "cursor-not-allowed opacity-50",
            inputGroupClassName,
          )}
          onPointerDown={(event) => {
            if (isDisabled || event.target instanceof HTMLButtonElement) return;
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          {selectedValues.map((value) => {
            const option = optionByValue.get(value);
            const optionIsLoading = loading && !option;
            const label =
              option?.label ?? (optionIsLoading ? loadingMessage : value);
            const unavailable = optionIsLoading
              ? false
              : (option?.unavailable ?? !option);
            return (
              <Badge
                key={value}
                variant="secondary"
                aria-busy={optionIsLoading ? true : undefined}
                className={cn(
                  "min-w-0 gap-0.5 group-focus-within/input-group:border-border/60 group-focus-within/input-group:bg-background group-focus-within/input-group:text-foreground",
                  readOnly ? "pr-2" : "pr-0.5",
                  optionIsLoading && "animate-pulse",
                  unavailable && "border-dashed text-muted-foreground",
                )}
                title={unavailable ? `${label} is unavailable` : undefined}
              >
                <span className="max-w-48 truncate">{label}</span>
                {!readOnly ? (
                  <InputGroupButton
                    type="button"
                    size="icon-xs"
                    disabled={disabled}
                    aria-label={`Remove ${label}`}
                    onClick={() => {
                      updateValue(
                        selectedValues.filter(
                          (selectedValue) => selectedValue !== value,
                        ),
                      );
                      refocusInput();
                    }}
                  >
                    <X aria-hidden="true" />
                  </InputGroupButton>
                ) : null}
              </Badge>
            );
          })}
          {!readOnly ? (
            <CommandInput
              ref={inputRef}
              value={query}
              disabled={disabled}
              aria-label={inputAriaLabel}
              aria-expanded={open}
              aria-invalid={hasErrors ? true : undefined}
              placeholder={placeholder}
              withAddonIcon={false}
              inputWrapperClassName="min-w-32 flex-1 p-0"
              inputGroupClassName="h-7! rounded-none! border-0 bg-transparent! shadow-none! ring-0!"
              className="min-w-24 bg-transparent! px-0"
              onFocus={() => setOpen(true)}
              onBlur={() => {
                field.handleBlur();
                requestAnimationFrame(() => {
                  const activeElement = document.activeElement;
                  if (
                    activeElement instanceof Node &&
                    !controlRef.current?.contains(activeElement) &&
                    !optionsRef.current?.contains(activeElement)
                  ) {
                    setOpen(false);
                  }
                });
              }}
              onValueChange={updateQuery}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false);
                  return;
                }
                if (
                  event.key === "Backspace" &&
                  query === "" &&
                  selectedValues.length > 0
                ) {
                  event.preventDefault();
                  updateValue(selectedValues.slice(0, -1));
                }
              }}
            />
          ) : null}
        </div>
        {open && !isDisabled ? (
          <div
            ref={optionsRef}
            onPointerDown={(event) => event.preventDefault()}
            className={cn(
              "absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
              popoverClassName,
            )}
          >
            <CommandList>
              {loading ? (
                <div
                  role="status"
                  className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-muted-foreground"
                >
                  <Spinner className="size-4" />
                  {loadingMessage}
                </div>
              ) : error ? (
                <div
                  role="alert"
                  className="px-3 py-6 text-center text-sm text-destructive"
                >
                  {error}
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  <CommandGroup>
                    {availableOptions.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={`${option.label} ${option.description ?? ""}`}
                        disabled={option.unavailable}
                        onSelect={() => {
                          updateValue([...selectedValues, option.value]);
                          updateQuery("");
                          setOpen(true);
                          refocusInput();
                        }}
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{option.label}</span>
                          {option.description ? (
                            <span className="block truncate text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          ) : null}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </div>
        ) : null}
      </Command>
      {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

interface DurationFieldProps extends Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "type" | "value" | "onChange" | "min" | "max"
> {
  min?: number;
  max?: number;
  unit?: string;
  label?: string;
  description?: string;
  icon?: LucideIcon;
  fieldClassName?: string;
  inputGroupClassName?: string;
  inputClassName?: string;
}

function DurationField({
  min = 0,
  max,
  unit = "min",
  label,
  description,
  icon: Icon = Clock3,
  fieldClassName,
  inputGroupClassName,
  inputClassName,
  readOnly = false,
  ...props
}: DurationFieldProps) {
  const field = useFieldContext<number | null>();
  const hasErrors = field.state.meta.errors.length > 0;

  return (
    <Field
      className={cn("w-auto", fieldClassName)}
      data-invalid={hasErrors ? true : undefined}
    >
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <InputGroup
        className={cn(
          "h-8 w-auto has-[>[data-align=inline-end]]:[&>input]:pr-0",
          inputGroupClassName,
        )}
      >
        {Icon ? (
          <InputGroupAddon align="inline-start" className="pr-0">
            <Icon className="size-3.5" aria-hidden="true" />
          </InputGroupAddon>
        ) : null}
        <InputGroupInput
          {...props}
          id={field.name}
          name={field.name}
          type="number"
          inputMode="numeric"
          autoComplete="off"
          min={min}
          max={max}
          readOnly={readOnly}
          tabIndex={readOnly ? -1 : props.tabIndex}
          value={field.state.value ?? ""}
          aria-invalid={hasErrors ? true : undefined}
          className={cn(
            "w-auto min-w-[1ch] max-w-[4ch] flex-none appearance-none px-0 text-right tabular-nums field-sizing-content [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
            inputClassName,
          )}
          onChange={(event) => {
            const input = event.currentTarget.value;
            field.handleChange(input === "" ? null : Number(input));
          }}
        />
        {unit ? (
          <InputGroupAddon align="inline-end" className="pl-1.5">
            {unit}
          </InputGroupAddon>
        ) : null}
      </InputGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

interface TextFieldProps extends React.ComponentProps<typeof Input> {
  label?: string;
  loading?: boolean;
  fieldClassName?: string;
  labelClassName?: string;
  inputGroupClassName?: string;
  inputClassName?: string;
  description?: string;
  icon?: LucideIcon;
  addonRight?: React.ReactNode;
}

function TextField({
  label,
  loading = false,
  fieldClassName,
  labelClassName,
  inputGroupClassName,
  inputClassName,
  description,
  icon: Icon,
  addonRight,
  ...props
}: TextFieldProps) {
  const field = useFieldContext<string | null>();
  const hasErrors = field.state.meta.errors.length > 0;
  const isReadOnly = props.readOnly === true;

  return (
    <Field
      data-invalid={hasErrors ? true : undefined}
      className={cn("w-full", fieldClassName)}
    >
      {label ? (
        <FieldLabel htmlFor={field.name} className={labelClassName}>
          {label}
        </FieldLabel>
      ) : null}
      <InputGroup
        className={cn(
          isReadOnly &&
            "has-[[data-slot=input-group-control]:focus-visible]:border-input has-[[data-slot=input-group-control]:focus-visible]:ring-0",
          inputGroupClassName,
        )}
      >
        <InputGroupInput
          {...props}
          id={field.name}
          name={field.name}
          tabIndex={isReadOnly ? -1 : props.tabIndex}
          value={field.state.value ?? ""}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={hasErrors ? true : undefined}
          className={cn(inputClassName)}
        />
        {Icon ? (
          <InputGroupAddon>
            <Icon className="size-4" />
          </InputGroupAddon>
        ) : null}
        {loading ? (
          <InputGroupAddon align="inline-end">
            <Spinner className="size-4" />
          </InputGroupAddon>
        ) : null}

        {addonRight ? (
          <InputGroupAddon align="inline-end">{addonRight}</InputGroupAddon>
        ) : null}
      </InputGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {field.state.meta.errors.length > 0 ? (
        <FieldError errors={field.state.meta.errors} />
      ) : null}
    </Field>
  );
}

function formatCalendarDatePart(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseCalendarDate(value: string) {
  const datePart = value.split("T")[0] ?? "";
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

export interface CalendarFieldProps {
  label?: string;
  description?: string;
  placeholder?: string;
  mode?: "date" | "time" | "datetime";
  defaultTime?: string;
  locale?: Locale;
  readOnly?: boolean;
  disabled?: boolean;
  fieldClassName?: string;
  triggerClassName?: string;
  popoverClassName?: string;
}

/**
 * Date-only values use `YYYY-MM-DD`, time-only values use `HH:mm`, and
 * combined values use `YYYY-MM-DDTHH:mm`.
 */
function CalendarField({
  label,
  description,
  placeholder,
  mode = "date",
  defaultTime = "00:00",
  locale,
  readOnly = false,
  disabled = false,
  fieldClassName,
  triggerClassName,
  popoverClassName,
}: CalendarFieldProps) {
  const includeDate = mode !== "time";
  const includeTime = mode !== "date";
  const field = useFieldContext<string | null>();
  const value = field.state.value ?? "";
  const hasErrors = field.state.meta.errors.length > 0;
  const selected = includeDate ? parseCalendarDate(value) : undefined;
  const valueTime = includeDate
    ? value.split("T")[1]?.slice(0, 5)
    : value.slice(0, 5);
  const [pendingTime, setPendingTime] = React.useState<string | null>(null);
  const time = valueTime ?? pendingTime ?? defaultTime;
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number>();
  const inputId = React.useId();
  const isDisabled = disabled || readOnly;

  React.useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || !includeDate) return;

    const updateWidth = () =>
      setTriggerWidth(trigger.getBoundingClientRect().width);
    const observer = new ResizeObserver(updateWidth);
    observer.observe(trigger);
    updateWidth();
    return () => observer.disconnect();
  }, [includeDate]);

  if (!includeDate) {
    return (
      <Field
        data-invalid={hasErrors ? true : undefined}
        className={fieldClassName}
      >
        {label ? <FieldLabel htmlFor={inputId}>{label}</FieldLabel> : null}
        <Input
          id={inputId}
          name={field.name}
          type="time"
          value={time}
          readOnly={readOnly}
          disabled={disabled}
          aria-label={label ?? "Time"}
          aria-invalid={hasErrors ? true : undefined}
          onChange={(event) => field.handleChange(event.target.value)}
          step="30"
        />
        {description ? (
          <FieldDescription>{description}</FieldDescription>
        ) : null}
        {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
      </Field>
    );
  }

  const displayDate = selected
    ? new Date(
        selected.getFullYear(),
        selected.getMonth(),
        selected.getDate(),
        Number(time.split(":")[0] ?? 0),
        Number(time.split(":")[1] ?? 0),
      )
    : undefined;

  return (
    <Field
      data-invalid={hasErrors ? true : undefined}
      className={fieldClassName}
    >
      {label ? <FieldLabel htmlFor={inputId}>{label}</FieldLabel> : null}
      <Popover>
        <PopoverTrigger
          render={
            <Button
              ref={triggerRef}
              id={inputId}
              type="button"
              variant="outline"
              disabled={isDisabled}
              aria-label={
                label
                  ? `${label} ${includeTime ? "date and time" : "date"}`
                  : includeTime
                    ? "Date and time"
                    : "Date"
              }
              aria-invalid={hasErrors ? true : undefined}
              className={cn(
                "w-full justify-between font-normal shadow-none",
                triggerClassName,
              )}
            />
          }
        >
          {displayDate
            ? format(
                displayDate,
                includeTime ? "d MMM yyyy, hh:mm a" : "d MMM yyyy",
                { locale },
              )
            : (placeholder ??
              `Choose ${includeTime ? "date and time" : "date"}`)}
          <CalendarIcon data-icon="inline-end" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn("min-w-0 gap-0 overflow-hidden p-0", popoverClassName)}
          style={{ width: triggerWidth, maxWidth: triggerWidth }}
        >
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            locale={locale}
            className="w-full"
            onSelect={(date) => {
              if (!date) return;
              const datePart = formatCalendarDatePart(date);
              field.handleChange(
                includeTime ? `${datePart}T${time}` : datePart,
              );
            }}
          />
          {includeTime ? (
            <Field className="border-t p-3">
              <FieldLabel htmlFor={`${inputId}-time`}>Time</FieldLabel>
              <Input
                id={`${inputId}-time`}
                type="time"
                value={time}
                aria-label={label ? `${label} time` : "Time"}
                onChange={(event) => {
                  const nextTime = event.target.value;
                  setPendingTime(nextTime);
                  const datePart = value.split("T")[0];
                  if (datePart) field.handleChange(`${datePart}T${nextTime}`);
                }}
              />
            </Field>
          ) : null}
        </PopoverContent>
      </Popover>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

type OTPFieldProps = Omit<
  React.ComponentProps<typeof InputOTP>,
  "render" | "children" | "maxLength"
> & {
  label?: string;
  description?: string;
  splitBy?: number;
  maxLength?: number;
};

function OTPField({
  label,
  description,
  maxLength = 6,
  splitBy = 3,
  ...props
}: OTPFieldProps) {
  const field = useFieldContext<string>();
  const hasErrors = field.state.meta.errors.length > 0;
  const groupCount = Math.ceil(maxLength / splitBy);
  return (
    <Field
      data-invalid={hasErrors}
      className="flex w-full flex-col justify-center"
    >
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <InputOTP
        {...props}
        maxLength={maxLength}
        value={field.state.value}
        onChange={(value) => field.handleChange(value)}
      >
        {Array.from({ length: groupCount }).map((_, index) => (
          <React.Fragment key={index.toString()}>
            <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
              {Array.from({ length: splitBy }).map((_, slotIndex) => (
                <InputOTPSlot
                  key={(index * splitBy + slotIndex).toString()}
                  index={index * splitBy + slotIndex}
                  aria-invalid={hasErrors}
                />
              ))}
            </InputOTPGroup>
            {index < groupCount - 1 && <InputOTPSeparator className="mx-2" />}
          </React.Fragment>
        ))}
      </InputOTP>
      {/* <InputOTP
        {...props}
        containerClassName="w-full"
        aria-invalid={hasErrors}
        name={field.name}
        value={field.state.value}
        onChange={(value) => field.handleChange(value)}
      /> */}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

interface SplitTextFieldsProps {
  label?: string;
  loading?: boolean;
  fieldClassName?: string;
  inputGroupClassName?: string;
  description?: string;
  icons?: [LucideIcon | null, LucideIcon | null];
  disabled?: boolean;
  maxLength?: [number | null, number | null];
  size?:
    | {
        kind: "flex";
        values: [number, number];
      }
    | {
        kind: "width";
        values: [number | null, number | null];
      };
}

function SplitTextField({
  label,
  fieldClassName,
  inputGroupClassName,
  description,
  icons,
  disabled,
  size = {
    kind: "flex",
    values: [1, 1],
  },
  maxLength,
  ...props
}: SplitTextFieldsProps) {
  const field = useFieldContext<string>();
  const hasErrors = field.state.meta.errors.length > 0;

  const [LeftIcon, RightIcon] = icons ?? [null, null];

  const [leftValue = "", rightValue = ""] = (field.state.value ?? "").split(
    "-",
  );

  function handleChange(value: string, side: "left" | "right") {
    let newLeft = leftValue;
    let newRight = rightValue;

    const limitLeft = maxLength?.[0];
    const limitRight = maxLength?.[1];

    if (side === "left") {
      newLeft = value;
      if (typeof limitLeft === "number" && newLeft.length > limitLeft) {
        newLeft = newLeft.slice(0, limitLeft);
      }
    } else {
      newRight = value;
      if (typeof limitRight === "number" && newRight.length > limitRight) {
        newRight = newRight.slice(0, limitRight);
      }
    }

    field.handleChange(`${newLeft}-${newRight}`);
  }
  return (
    <Field
      data-invalid={hasErrors ? true : undefined}
      className={cn("w-full", fieldClassName)}
    >
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <div className="flex flex-row gap-0">
        <InputGroup
          className={cn(
            "rounded-r-none",
            {
              "shrink-0": size.kind === "width" && size.values[0] !== null,
            },
            inputGroupClassName,
          )}
          style={
            size.kind === "flex"
              ? { flex: size.values[0] }
              : size.kind === "width"
                ? { width: size.values[0] ? size.values[0] : undefined }
                : undefined
          }
        >
          <InputGroupInput
            {...props}
            name={field.name}
            value={leftValue}
            onChange={(e) => handleChange(e.target.value, "left")}
            aria-invalid={hasErrors ? true : undefined}
            disabled={disabled}
          />
          {LeftIcon ? (
            <InputGroupAddon>
              <LeftIcon className="size-4 text-muted-foreground" />
            </InputGroupAddon>
          ) : null}
        </InputGroup>
        <InputGroup
          className={cn(
            "rounded-l-none border-l-0",
            {
              "shrink-0": size.kind === "width" && size.values[1] !== null,
            },
            inputGroupClassName,
          )}
          style={
            size.kind === "flex"
              ? { flex: size.values[1] }
              : size.kind === "width"
                ? { width: size.values[1] ? `${size.values[1]}` : undefined }
                : undefined
          }
        >
          <InputGroupInput
            {...props}
            name={field.name}
            value={rightValue}
            onChange={(e) => handleChange(e.target.value, "right")}
            aria-invalid={hasErrors ? true : undefined}
            disabled={disabled}
          />
          {RightIcon ? (
            <InputGroupAddon>
              <RightIcon className="size-4 text-muted-foreground" />
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      </div>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {field.state.meta.errors.length > 0 ? (
        <FieldError errors={field.state.meta.errors} />
      ) : null}
    </Field>
  );
}

interface ButtonGroupTextFieldProps extends React.ComponentProps<typeof Input> {
  label?: string;
  loading?: boolean;
  fieldClassName?: string;
  description?: string;
  icon?: LucideIcon;
  addonRight?: React.ReactNode;
  prefix?: string;
  suffix?: string;
  forceLowerCase?: boolean;
}

export function ButtonGroupTextField({
  label,
  loading = false,
  fieldClassName,
  description,
  icon: Icon,
  addonRight,
  prefix,
  suffix,
  forceLowerCase,
  ...props
}: ButtonGroupTextFieldProps) {
  const field = useFieldContext<string>();
  const hasErrors = field.state.meta.errors.length > 0;

  return (
    <Field data-invalid={hasErrors} className={cn("w-full", fieldClassName)}>
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <ButtonGroup>
        {prefix ? <ButtonGroupText>{prefix}</ButtonGroupText> : null}
        <InputGroup>
          <InputGroupInput
            {...props}
            name={field.name}
            value={field.state.value}
            onChange={(e) =>
              forceLowerCase
                ? field.handleChange(e.target.value.toLowerCase())
                : field.handleChange(e.target.value)
            }
            aria-invalid={hasErrors}
          />
          {Icon ? (
            <InputGroupAddon>
              <Icon />
            </InputGroupAddon>
          ) : null}
          {addonRight ? (
            <InputGroupAddon align="inline-end">{addonRight}</InputGroupAddon>
          ) : null}
        </InputGroup>
        {suffix ? <ButtonGroupText>{suffix}</ButtonGroupText> : null}
      </ButtonGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <FieldError errors={field.state.meta.errors} />
    </Field>
  );
}

interface TextareaFieldProps extends React.ComponentProps<typeof Textarea> {
  label?: string;
  description?: string;
}

function TextareaField({ label, description, ...props }: TextareaFieldProps) {
  const field = useFieldContext<string | null>();
  const hasErrors = field.state.meta.errors.length > 0;
  const isReadOnly = props.readOnly === true;

  return (
    <Field data-invalid={hasErrors ? true : undefined} className="w-full">
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <Textarea
        {...props}
        id={field.name}
        name={field.name}
        tabIndex={isReadOnly ? -1 : props.tabIndex}
        aria-invalid={hasErrors ? true : undefined}
        value={field.state.value ?? ""}
        onChange={(e) => field.handleChange(e.target.value)}
        className={cn(
          isReadOnly && "focus-visible:border-transparent focus-visible:ring-0",
          props.className,
        )}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

interface TextareaGroupFieldProps extends React.ComponentProps<
  typeof Textarea
> {
  label?: string;
  description?: string;
  fieldClassName?: string;
  inputGroupClassName?: string;
  textareaClassName?: string;
  labelClassName?: string;
}

function TextareaGroupField({
  label,
  description,
  fieldClassName,
  inputGroupClassName,
  textareaClassName,
  labelClassName,
  ...props
}: TextareaGroupFieldProps) {
  const field = useFieldContext<string | null>();
  const hasErrors = field.state.meta.errors.length > 0;
  const isReadOnly = props.readOnly === true;

  return (
    <Field
      data-invalid={hasErrors ? true : undefined}
      className={cn("w-full", fieldClassName)}
    >
      <InputGroup
        className={cn(
          isReadOnly &&
            "has-[[data-slot=input-group-control]:focus-visible]:border-input has-[[data-slot=input-group-control]:focus-visible]:ring-0",
          inputGroupClassName,
        )}
      >
        {label ? (
          <InputGroupAddon align="block-start">
            <FieldLabel htmlFor={field.name} className={labelClassName}>
              {label}
            </FieldLabel>
          </InputGroupAddon>
        ) : null}
        <InputGroupTextarea
          {...props}
          id={field.name}
          name={field.name}
          tabIndex={isReadOnly ? -1 : props.tabIndex}
          aria-invalid={hasErrors ? true : undefined}
          value={field.state.value ?? ""}
          onChange={(e) => field.handleChange(e.target.value)}
          className={textareaClassName}
        />
      </InputGroup>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

interface SelectFieldProps<V extends string> extends Omit<
  React.ComponentProps<typeof Select>,
  "value" | "onValueChange"
> {
  label?: string;
  placeholder?: string;
  description?: string;
  readOnly?: boolean;
  fieldClassName?: string;
  triggerAriaLabel?: string;
  triggerClassName?: string;
  contentClassName?: string;
  children?: React.ReactNode;
  options?: {
    label: string;
    value: V;
  }[];
}

export function SelectField<V extends string>({
  label,
  placeholder,
  description,
  readOnly = false,
  disabled = false,
  fieldClassName,
  triggerAriaLabel,
  triggerClassName,
  contentClassName,
  children,
  options,
  ...props
}: SelectFieldProps<V>) {
  const field = useFieldContext<V>();
  const hasErrors = field.state.meta.errors.length > 0;
  const isDisabled = disabled || readOnly;

  return (
    <Field
      data-invalid={hasErrors ? true : undefined}
      className={cn("w-full", fieldClassName)}
    >
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      <Select
        value={field.state.value ?? ""}
        onValueChange={(value) => field.handleChange(value as V)}
        disabled={isDisabled}
        {...props}
      >
        <SelectTrigger
          id={field.name}
          aria-label={triggerAriaLabel}
          tabIndex={readOnly ? -1 : undefined}
          className={triggerClassName}
          hideIcon={readOnly}
        >
          {field.state.value ? (
            <SelectValue>
              {options?.find((o) => o.value === field.state.value)?.label}
            </SelectValue>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {options?.map((t) => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

interface CheckboxFieldProps extends React.ComponentProps<typeof Checkbox> {
  children?: React.ReactNode;
  containerClassName?: string;
}

export function CheckboxField({
  children,
  containerClassName,
  ...props
}: CheckboxFieldProps) {
  const field = useFieldContext<boolean>();

  return (
    <div className={cn("w-full", containerClassName)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={field.name}
          {...props}
          checked={field.state.value}
          onCheckedChange={field.handleChange}
        />
        <label
          htmlFor={field.name}
          className="select-none text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {children}
        </label>
      </div>
      <ErrorsField className="mt-1.5 pl-3" meta={field.state.meta} />
    </div>
  );
}

interface RadioFieldProps extends React.ComponentProps<typeof RadioGroup> {
  label?: string;
  description?: string;
  options: {
    id: string;
    label: string;
    value: string;
    orientation?: "horizontal" | "vertical";
    image?: string | null;
    description?: string | null;
  }[];
}

function RadioField({
  label,
  description,
  options,
  ...props
}: RadioFieldProps) {
  const field = useFieldContext<string>();
  const hasErrors = field.state.meta.errors.length > 0;
  return (
    <FieldSet data-invalid={hasErrors ? true : undefined}>
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <RadioGroup
        {...props}
        value={field.state.value}
        onValueChange={field.handleChange}
      >
        <ScrollArea className="overflow-x-auto -ml-4 overflow-y-hidden -mt-2">
          <div className="flex gap-2">
            {options.map((option) => {
              return (
                <Field
                  key={option.id}
                  orientation={option.orientation ?? "horizontal"}
                  className={cn(
                    "border rounded-md relative w-[250px] transition-colors duration-300",
                    field.state.value === option.value
                      ? "ring-3 ring-domain/40 border-domain"
                      : "",
                  )}
                >
                  <div className="flex flex-col gap-1 w-full h-full">
                    <FieldLabel
                      htmlFor={option.id}
                      className="font-normal flex flex-col p-4 w-full h-full"
                    >
                      {option.image ? (
                        <img
                          src={option.image}
                          alt={option.label}
                          className="w-10 h-10 rounded-md"
                          width={40}
                          height={40}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                          <Camera className="size-4 text-muted-foreground" />
                        </div>
                      )}
                      <span className="text-lg font-medium line-clamp-1">
                        {option.label}
                      </span>
                      {option.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {option.description}
                        </p>
                      ) : null}
                    </FieldLabel>
                  </div>
                  <div className="absolute right-3 top-3">
                    <RadioGroupItem
                      className="ml-auto -mt-6"
                      value={option.value}
                      id={option.id}
                    />
                  </div>
                </Field>
              );
            })}
          </div>
        </ScrollArea>
      </RadioGroup>
      {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
    </FieldSet>
  );
}

interface RadioGroupInputFieldProps extends Omit<
  React.ComponentProps<typeof RadioGroup>,
  "value" | "onValueChange"
> {
  label?: string;
  description?: string;
  options: {
    id: string;
    label: string;
    value: unknown;
    description?: string | null;
    disabled?: boolean;
    disabledReason?: string | null;
    disabledKind?: "locked_by_other" | "unavailable" | null;
    lockedBy?: string | null;
  }[];
  onOptionSubmit?: (value: string) => void;
  allowTextResponse?: boolean;
  inputPlaceholder?: string;
  inputLabel?: string;
}

function RadioGroupInputField({
  label,
  description,
  options,
  disabled,
  className,
  onOptionSubmit,
  inputPlaceholder,
  inputLabel,
  allowTextResponse,
  ...props
}: RadioGroupInputFieldProps) {
  const field = useFieldContext<{ selectedOptionId: string; text: string }>();
  const hasErrors = field.state.meta.errors.length > 0;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const optionRefs = React.useRef<Array<HTMLLabelElement | null>>([]);
  const pointerSelectRef = React.useRef(false);
  const selectedOptionId = field.state.value.selectedOptionId;
  const text = field.state.value.text;
  const selectedOption = options.find(
    (option) => option.id === selectedOptionId,
  );
  const hasSelectableOption =
    selectedOptionId.trim().length > 0 && selectedOption?.disabled !== true;
  const hasAnswer = hasSelectableOption || text.trim().length > 0;
  const firstEnabledOptionIndex = options.findIndex(
    (option) => !option.disabled,
  );
  const lastEnabledOptionIndex = (() => {
    for (let index = options.length - 1; index >= 0; index -= 1) {
      if (!options[index]?.disabled) {
        return index;
      }
    }
    return -1;
  })();

  React.useEffect(() => {
    if (disabled || firstEnabledOptionIndex < 0) {
      return;
    }

    requestAnimationFrame(() => {
      optionRefs.current[firstEnabledOptionIndex]?.focus();
    });
  }, [disabled, firstEnabledOptionIndex]);

  const selectOption = React.useCallback(
    (optionId: string) => {
      const option = options.find((candidate) => candidate.id === optionId);
      if (option?.disabled) {
        return;
      }
      field.handleChange({
        ...field.state.value,
        selectedOptionId: optionId,
      });
    },
    [field, options],
  );

  const findNextEnabledOptionIndex = React.useCallback(
    (fromIndex: number, direction: 1 | -1) => {
      if (options.length === 0) {
        return -1;
      }
      for (let offset = 1; offset <= options.length; offset += 1) {
        const nextIndex =
          (fromIndex + direction * offset + options.length) % options.length;
        if (!options[nextIndex]?.disabled) {
          return nextIndex;
        }
      }
      return -1;
    },
    [options],
  );

  const focusOption = React.useCallback(
    (index: number) => {
      const option = options[index];
      if (!option || option.disabled) {
        return;
      }

      selectOption(option.id);
      optionRefs.current[index]?.focus();
    },
    [options, selectOption],
  );

  const clearSelectedOption = React.useCallback(() => {
    if (!field.state.value.selectedOptionId) {
      return;
    }

    field.handleChange({
      ...field.state.value,
      selectedOptionId: "",
    });
  }, [field]);

  const focusInput = React.useCallback(() => {
    clearSelectedOption();
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [clearSelectedOption]);

  const getFocusedOptionIndex = React.useCallback(() => {
    const activeElement = document.activeElement;
    return optionRefs.current.findIndex(
      (optionElement) =>
        optionElement === activeElement ||
        (activeElement ? optionElement?.contains(activeElement) : false),
    );
  }, []);

  const submitForm = React.useCallback((element: HTMLElement) => {
    element.closest("form")?.requestSubmit();
  }, []);

  return (
    <FieldSet data-invalid={hasErrors ? true : undefined}>
      {label ? <FieldLabel htmlFor={field.name}>{label}</FieldLabel> : null}
      {description ? <FieldDescription>{description}</FieldDescription> : null}
      <RadioGroup
        {...props}
        defaultValue={options[0]?.id}
        className={cn("gap-2", className)}
        value={selectedOptionId}
        onValueChange={(value) => {
          selectOption(value);
        }}
        onKeyDownCapture={(event) => {
          if (disabled || firstEnabledOptionIndex < 0) {
            return;
          }

          const focusedOptionIndex = getFocusedOptionIndex();
          if (focusedOptionIndex < 0) {
            return;
          }

          if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            event.preventDefault();
            event.stopPropagation();
            if (
              focusedOptionIndex === lastEnabledOptionIndex &&
              allowTextResponse
            ) {
              focusInput();
              return;
            }
            const nextIndex = findNextEnabledOptionIndex(focusedOptionIndex, 1);
            if (nextIndex >= 0) {
              focusOption(nextIndex);
            }
            return;
          }

          if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            event.preventDefault();
            event.stopPropagation();
            if (
              focusedOptionIndex === firstEnabledOptionIndex &&
              allowTextResponse
            ) {
              focusInput();
              return;
            }
            const nextIndex = findNextEnabledOptionIndex(
              focusedOptionIndex,
              -1,
            );
            if (nextIndex >= 0) {
              focusOption(nextIndex);
            }
          }
        }}
      >
        {options.map((option, index) => {
          const isSelected = option.id === selectedOptionId;
          const isOptionDisabled = disabled || option.disabled === true;
          return (
            <FieldLabel
              key={option.id}
              ref={(element) => {
                optionRefs.current[index] = element;
              }}
              htmlFor={`${field.name}-${option.id}`}
              tabIndex={
                isOptionDisabled
                  ? -1
                  : isSelected ||
                      (!selectedOptionId && index === firstEnabledOptionIndex)
                    ? 0
                    : -1
              }
              data-selected={isSelected ? true : undefined}
              data-disabled={isOptionDisabled ? true : undefined}
              className="group/radio-input rounded-md outline-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-55"
              onPointerDown={() => {
                pointerSelectRef.current = true;
              }}
              onClick={(event) => {
                if (isOptionDisabled || !pointerSelectRef.current) {
                  pointerSelectRef.current = false;
                  return;
                }

                pointerSelectRef.current = false;
                event.preventDefault();
                selectOption(option.id);
                onOptionSubmit?.(option.id);
              }}
              onKeyDown={(event) => {
                if (isOptionDisabled) {
                  return;
                }

                if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                  event.preventDefault();
                  if (index === lastEnabledOptionIndex && allowTextResponse) {
                    focusInput();
                    return;
                  }
                  const nextIndex = findNextEnabledOptionIndex(index, 1);
                  if (nextIndex >= 0) {
                    focusOption(nextIndex);
                  }
                  return;
                }

                if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                  event.preventDefault();
                  if (index === firstEnabledOptionIndex && allowTextResponse) {
                    focusInput();
                    return;
                  }
                  const nextIndex = findNextEnabledOptionIndex(index, -1);
                  if (nextIndex >= 0) {
                    focusOption(nextIndex);
                  }
                  return;
                }

                if (event.key === "Enter") {
                  event.preventDefault();
                  selectOption(option.id);
                  if (onOptionSubmit) {
                    onOptionSubmit(option.id);
                    return;
                  }
                  submitForm(event.currentTarget);
                  return;
                }

                if (event.key === " ") {
                  event.preventDefault();
                  selectOption(option.id);
                  return;
                }

                if (event.key.length === 1) {
                  inputRef.current?.focus();
                }
              }}
            >
              <Field
                orientation="horizontal"
                className="relative cursor-pointer rounded-md border border-input bg-transparent py-2 pl-3 pr-14 transition-colors group-focus-visible/radio-input:border-ring group-focus-visible/radio-input:ring-3 group-focus-visible/radio-input:ring-ring/50 group-data-[selected=true]/radio-input:border-ring group-data-[selected=true]/radio-input:bg-accent group-data-[disabled=true]/radio-input:cursor-not-allowed group-data-[disabled=true]/radio-input:bg-transparent group-data-[disabled=true]/radio-input:text-muted-foreground group-data-[disabled=true]/radio-input:hover:bg-transparent group-data-[disabled=true]/radio-input:hover:text-muted-foreground group-not-data-[disabled=true]/radio-input:hover:bg-accent group-not-data-[disabled=true]/radio-input:hover:text-accent-foreground"
              >
                <FieldContent className="min-w-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <FieldTitle className="min-w-0 flex-1 truncate">
                      {option.label}
                    </FieldTitle>
                    {option.disabledKind === "locked_by_other" ? (
                      <div className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-1 font-medium text-amber-200 text-xs shadow-[0_0_0_1px_color-mix(in_oklch,var(--color-amber-400)_10%,transparent)]">
                        <Lock className="size-3.5" aria-hidden="true" />
                        {option.lockedBy
                          ? `Locked by ${option.lockedBy}`
                          : "Locked"}
                      </div>
                    ) : null}
                  </div>
                  {option.disabledKind !== "locked_by_other" &&
                  (option.disabledReason || option.description) ? (
                    <FieldDescription>
                      {option.disabledReason ?? option.description}
                    </FieldDescription>
                  ) : null}
                </FieldContent>
                <RadioGroupItem
                  id={`${field.name}-${option.id}`}
                  value={option.id}
                  disabled={isOptionDisabled}
                  className="sr-only absolute"
                />
              </Field>
            </FieldLabel>
          );
        })}
      </RadioGroup>

      {allowTextResponse ? (
        <InputGroup
          className="h-11 bg-transparent has-disabled:bg-transparent has-disabled:opacity-100 dark:has-disabled:bg-transparent pr-1"
          data-disabled={disabled ? true : undefined}
        >
          <InputGroupInput
            disabled={disabled}
            ref={inputRef}
            className="placeholder:text-muted-foreground/60"
            onFocus={clearSelectedOption}
            onClick={clearSelectedOption}
            onKeyDown={(event) => {
              if (disabled || firstEnabledOptionIndex < 0) {
                return;
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                if (lastEnabledOptionIndex >= 0) {
                  focusOption(lastEnabledOptionIndex);
                }
                return;
              }

              if (event.key === "ArrowDown") {
                event.preventDefault();
                focusOption(firstEnabledOptionIndex);
              }
            }}
            onChange={(event) =>
              field.handleChange({
                ...field.state.value,
                selectedOptionId: "",
                text: event.currentTarget.value,
              })
            }
            placeholder={inputPlaceholder}
            value={text}
            aria-label={inputLabel}
          />
          <InputGroupAddon align="inline-end">
            <PromptInputSubmit
              disabled={disabled || !hasAnswer}
              size="icon-sm"
              status={disabled ? "submitting" : "ready"}
              aria-label="Send details"
              className="h-7.5"
            />
          </InputGroupAddon>
        </InputGroup>
      ) : null}
      {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
    </FieldSet>
  );
}

interface SwitchFieldProps extends React.ComponentProps<typeof Switch> {
  label?: string;
  description?: string;
}
export function SwitchField({
  label,
  description,
  ...props
}: SwitchFieldProps) {
  const field = useFieldContext<boolean>();
  const hasErrors = field.state.meta.errors.length > 0;
  return (
    <Field data-invalid={hasErrors ? true : undefined} orientation="horizontal">
      <FieldContent>
        <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
      </FieldContent>
      <Switch
        id={field.name}
        {...props}
        checked={field.state.value}
        onCheckedChange={field.handleChange}
      />
      {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

type MarkdownEditorFieldProps = Omit<
  MarkdownEditorProps,
  "initialContent" | "onUpdate"
> & {
  fieldClassName?: string;
};

function MarkdownEditorField({
  fieldClassName,
  ...props
}: MarkdownEditorFieldProps) {
  const field = useFieldContext<string>();
  const hasErrors = field.state.meta.errors.length > 0;
  return (
    <Field
      data-invalid={hasErrors ? true : undefined}
      className={cn("min-h-0 flex-1", fieldClassName)}
    >
      <MarkdownEditor
        {...props}
        onUpdate={field.handleChange}
        initialContent={field.state.value}
      />
      {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

export type AssetKind = "image" | "video" | "audio";

export type UploadStatus =
  "hashing" | "uploading" | "processing" | "uploaded" | "failed";

type AssetUploadItemBase = {
  localId: string;
  _id: string;
  source?: unknown;
  file?: File;
  blobUrl?: string;
  url?: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  alt: string;
  status: UploadStatus;
  progress: number;
  assetId?: string;
  playbackId?: string;
  processingState?:
    "ingesting" | "transcoding" | "completed" | "live" | "errored";
  processingProgress?: number;
  error?: string;
};

export type AssetUploadItem =
  | (AssetUploadItemBase & {
      kind: "image";
      width: number;
      height: number;
    })
  | (AssetUploadItemBase & {
      kind: "video";
      width: number;
      height: number;
      duration: number;
    })
  | (AssetUploadItemBase & {
      kind: "audio";
      duration: number;
    });

type MediaFieldValueBase = {
  _id?: string;
  assetId: string;
  source?: unknown;
  fileName: string;
  mimeType: string;
  size: number;
  sortOrder: number;
  alt: string;
};

type MediaFieldValue =
  | (MediaFieldValueBase & {
      kind: "image";
      url: string;
      width: number;
      height: number;
    })
  | (MediaFieldValueBase & {
      kind: "video";
      url?: string;
      playbackId?: string;
      width: number;
      height: number;
      duration: number;
    })
  | (MediaFieldValueBase & {
      kind: "audio";
      url: string;
      duration: number;
    });

type AssetUploadFilesInput =
  Iterable<File> | { length: number; item(index: number): File | null };

type AssetUploadController = {
  items: AssetUploadItem[];
  addFiles: (files: AssetUploadFilesInput) => string[];
  removeItem: (localId: string) => void;
  updateAlt: (localId: string, alt: string) => void;
  retryItem: (localId: string) => void;
  reorder: (fromIndex: number, toIndex: number) => void;
  reset: () => void;
  isUploading: boolean;
};

export function requireAssetUploadController(
  upload: AssetUploadController | null | undefined,
): AssetUploadController {
  if (
    !upload ||
    !Array.isArray(upload.items) ||
    typeof upload.addFiles !== "function" ||
    typeof upload.removeItem !== "function" ||
    typeof upload.updateAlt !== "function" ||
    typeof upload.retryItem !== "function" ||
    typeof upload.reorder !== "function" ||
    typeof upload.reset !== "function"
  ) {
    throw new Error(
      "MediaField requires a valid AssetUploadController. Pass a standalone controller or an app-scoped controller.",
    );
  }
  return upload;
}

export type MediaVideoUploadItem = Extract<AssetUploadItem, { kind: "video" }>;

export type MediaVideoRenderProps = {
  item: MediaVideoUploadItem;
  title: string;
  className: string;
  aspectRatio: "16 / 9";
};

export type MediaVideoPlaceholderRenderProps = MediaVideoRenderProps & {
  state: "processing" | "failed";
};

export type MediaVideoRenderer = (
  props: MediaVideoRenderProps,
) => React.ReactNode;

export type MediaVideoPlaceholderRenderer = (
  props: MediaVideoPlaceholderRenderProps,
) => React.ReactNode;

interface MediaFieldProps {
  label?: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  syncFieldValue?: boolean;
  readOnly?: boolean;
  onAssetRemove?: (item: AssetUploadItem) => void;
  onAssetAltChange?: (item: AssetUploadItem, alt: string) => void;
  renderVideo?: MediaVideoRenderer;
  renderVideoPreview?: MediaVideoRenderer;
  renderVideoPlaceholder?: MediaVideoPlaceholderRenderer;
  videoPresentation?: "full" | "compact";
  showPreviewActions?: boolean;
  showPreviewDetails?: boolean;
  previewDetailsVisibility?: "always" | "hover-or-press";
  upload: AssetUploadController;
}

export function selectMediaFieldItems(
  items: AssetUploadItem[],
  multiple: boolean,
): AssetUploadItem[] {
  return multiple ? items : items.slice(-1);
}

function MediaField({
  label,
  description,
  upload,
  syncFieldValue = true,
  readOnly = false,
  onAssetRemove,
  onAssetAltChange,
  renderVideo,
  renderVideoPreview,
  renderVideoPlaceholder,
  videoPresentation = "full",
  showPreviewActions = true,
  showPreviewDetails = true,
  previewDetailsVisibility = "always",
  accept = "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm",
  multiple = true,
}: MediaFieldProps) {
  const field = useFieldContext<MediaFieldValue[]>();
  const {
    items: uploadItems,
    addFiles,
    removeItem,
    updateAlt,
    retryItem,
  } = requireAssetUploadController(upload);
  const items = selectMediaFieldItems(uploadItems, multiple);
  const hasErrors = field.state.meta.errors.length > 0;

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const hasItems = items.length > 0;

  // Sync uploaded items back to form field value
  React.useEffect(() => {
    if (!syncFieldValue) {
      return;
    }

    const currentValue = field.state.value ?? [];
    const currentByAssetId = new Map(
      currentValue.map((value) => [value.assetId, value]),
    );
    const uploadedItems = items
      .filter((item) => item.status === "uploaded" && item.assetId)
      .map<MediaFieldValue>((item, i) => {
        const previousValue = item.assetId
          ? currentByAssetId.get(item.assetId)
          : undefined;
        const base = {
          ...previousValue,
          assetId: item.assetId ?? "",
          alt: item.alt,
          _id: item._id,
          fileName: item.fileName ?? item.file?.name ?? "",
          mimeType: item.mimeType ?? item.file?.type ?? "",
          size: item.size ?? item.file?.size ?? 0,
          sortOrder: i,
          source: item.source,
        };

        if (item.kind === "audio") {
          return {
            ...base,
            kind: "audio",
            url: item.url ?? item.blobUrl ?? "",
            duration: item.duration,
          };
        }
        if (item.kind === "video") {
          return {
            ...base,
            kind: "video",
            url: item.url,
            playbackId: item.playbackId,
            width: item.width,
            height: item.height,
            duration: item.duration,
          };
        }

        return {
          ...base,
          kind: "image",
          url: item.url ?? item.blobUrl ?? "",
          width: item.width,
          height: item.height,
        };
      });

    const uploadedItemsChanged =
      currentValue.length !== uploadedItems.length ||
      currentValue.some((value, index) => {
        const uploadedItem = uploadedItems[index];
        return (
          !uploadedItem ||
          value.assetId !== uploadedItem.assetId ||
          value.alt !== uploadedItem.alt ||
          ("playbackId" in value ? value.playbackId : undefined) !==
            ("playbackId" in uploadedItem
              ? uploadedItem.playbackId
              : undefined) ||
          ("url" in value ? value.url : undefined) !==
            ("url" in uploadedItem ? uploadedItem.url : undefined)
        );
      });

    if (uploadedItemsChanged) {
      field.handleChange(uploadedItems);
    }
  }, [items, field, syncFieldValue]);

  const handleRemoveItem = React.useCallback(
    (localId: string) => {
      const item = items.find((currentItem) => currentItem.localId === localId);
      if (item) {
        onAssetRemove?.(item);
      }
      removeItem(localId);
    },
    [items, onAssetRemove, removeItem],
  );

  const handleAltChange = React.useCallback(
    (localId: string, alt: string) => {
      const item = items.find((currentItem) => currentItem.localId === localId);
      if (item) {
        onAssetAltChange?.({ ...item, alt }, alt);
      }
      updateAlt(localId, alt);
    },
    [items, onAssetAltChange, updateAlt],
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!readOnly && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files.item(0);
        addFiles(multiple || !file ? e.dataTransfer.files : [file]);
      }
    },
    [addFiles, multiple, readOnly],
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!readOnly) {
        setIsDragOver(true);
      }
    },
    [readOnly],
  );

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!readOnly && e.target.files && e.target.files.length > 0) {
        const file = e.target.files.item(0);
        addFiles(multiple || !file ? e.target.files : [file]);
        e.target.value = "";
      }
    },
    [addFiles, multiple, readOnly],
  );

  return (
    <Field data-invalid={hasErrors ? true : undefined} className="w-full">
      {label ? <FieldLabel>{label}</FieldLabel> : null}
      {description ? <FieldDescription>{description}</FieldDescription> : null}

      {!hasItems && !readOnly ? (
        <button
          type="button"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative flex min-h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
          )}
          onClick={() => fileInputRef.current?.click()}
          disabled={readOnly}
        >
          <Upload className="mb-2 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag & drop {multiple ? "files" : "a file"} here, or click to browse
          </p>
        </button>
      ) : null}

      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileSelect}
        disabled={readOnly}
        className="hidden"
      />

      {/* File previews */}
      {hasItems ? (
        <MediaPreviewCarousel
          items={items}
          isDragOver={isDragOver}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onAdd={() => fileInputRef.current?.click()}
          readOnly={readOnly}
          onRemove={handleRemoveItem}
          onAltChange={handleAltChange}
          onRetry={(localId) => retryItem(localId)}
          renderVideo={renderVideo}
          renderVideoPreview={renderVideoPreview}
          renderVideoPlaceholder={renderVideoPlaceholder}
          videoPresentation={videoPresentation}
          multiple={multiple}
          showPreviewActions={showPreviewActions}
          showPreviewDetails={showPreviewDetails}
          previewDetailsVisibility={previewDetailsVisibility}
        />
      ) : null}

      {hasErrors ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}

function MediaPreviewCarousel({
  items,
  isDragOver,
  readOnly,
  onDrop,
  onDragOver,
  onDragLeave,
  onAdd,
  onRemove,
  onAltChange,
  onRetry,
  renderVideo,
  renderVideoPreview,
  renderVideoPlaceholder,
  videoPresentation,
  multiple,
  showPreviewActions,
  showPreviewDetails,
  previewDetailsVisibility,
}: {
  items: AssetUploadItem[];
  isDragOver: boolean;
  readOnly: boolean;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onAdd: () => void;
  onRemove: (localId: string) => void;
  onAltChange: (localId: string, alt: string) => void;
  onRetry: (localId: string) => void;
  renderVideo?: MediaVideoRenderer;
  renderVideoPreview?: MediaVideoRenderer;
  renderVideoPlaceholder?: MediaVideoPlaceholderRenderer;
  videoPresentation: "full" | "compact";
  multiple: boolean;
  showPreviewActions: boolean;
  showPreviewDetails: boolean;
  previewDetailsVisibility: "always" | "hover-or-press";
}) {
  const [api, setApi] = React.useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [itemToRemove, setItemToRemove] =
    React.useState<AssetUploadItem | null>(null);
  const activeIndex = Math.min(selectedIndex, Math.max(items.length - 1, 0));
  const selectedItem = items[activeIndex];
  const previousItemIdsRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    if (!api) return;

    const updateSelectedIndex = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };

    updateSelectedIndex();
    api.on("select", updateSelectedIndex);
    api.on("reInit", updateSelectedIndex);

    return () => {
      api.off("select", updateSelectedIndex);
      api.off("reInit", updateSelectedIndex);
    };
  }, [api]);

  React.useEffect(() => {
    const previousItemIds = new Set(previousItemIdsRef.current);
    previousItemIdsRef.current = items.map((item) => item.localId);

    let newestUploadIndex = -1;
    for (let index = items.length - 1; index >= 0; index -= 1) {
      const item = items[index];
      if (!item) {
        continue;
      }
      if (!previousItemIds.has(item.localId) && item.status !== "uploaded") {
        newestUploadIndex = index;
        break;
      }
    }
    if (!api || newestUploadIndex === -1) {
      return;
    }

    api.scrollTo(newestUploadIndex);
    setSelectedIndex(newestUploadIndex);
  }, [api, items]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-and-drop wrapper around a Carousel with no native semantic equivalent
    <div
      className={cn(
        "relative",
        isDragOver ? "rounded-lg outline-2 outline-primary outline-dashed" : "",
      )}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
    >
      <Carousel setApi={setApi} opts={{ loop: items.length > 1 }}>
        <CarouselContent className="-ml-2">
          {items.map((item) => (
            <CarouselItem key={item.localId} className="pl-2">
              <MediaPreviewSlide
                item={item}
                readOnly={readOnly}
                onAltChange={(alt) => onAltChange(item.localId, alt)}
                renderVideo={renderVideo}
                renderVideoPreview={renderVideoPreview}
                renderVideoPlaceholder={renderVideoPlaceholder}
                videoPresentation={videoPresentation}
                showPreviewDetails={showPreviewDetails}
                previewDetailsVisibility={previewDetailsVisibility}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        {items.length > 1 ? (
          <>
            <CarouselPrevious className="left-3 border border-white/40 bg-white/70 text-black/75 shadow-lg shadow-black/30 backdrop-blur hover:border-white/80 hover:bg-white/95 hover:text-black disabled:opacity-40 [&_svg]:drop-shadow-sm" />
            <CarouselNext className="right-3 border border-white/40 bg-white/70 text-black/75 shadow-lg shadow-black/30 backdrop-blur hover:border-white/80 hover:bg-white/95 hover:text-black disabled:opacity-40 [&_svg]:drop-shadow-sm" />
          </>
        ) : null}
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
          {multiple && showPreviewActions ? (
            <div className="flex h-8 items-center rounded-full border border-white/60 bg-black/60 text-xs font-medium text-white shadow-lg shadow-black/25 backdrop-blur">
              <span className="px-3">
                {activeIndex + 1}/{items.length}
              </span>
              {!readOnly ? (
                <>
                  <span className="h-4 w-px bg-white/25" />
                  <button
                    type="button"
                    onClick={onAdd}
                    aria-label="Add media"
                    className="ml-2 mr-1.5 flex size-6 items-center justify-center rounded-full text-white/80 hover:bg-white/15 hover:text-white"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </>
              ) : null}
            </div>
          ) : !multiple && !readOnly && showPreviewActions ? (
            <button
              type="button"
              onClick={onAdd}
              aria-label="Replace media"
              className="flex size-8 items-center justify-center rounded-full border border-white/60 bg-black/60 text-white shadow-lg shadow-black/25 backdrop-blur hover:bg-black/75"
            >
              <Upload className="size-3.5" />
            </button>
          ) : null}
          {selectedItem?.status === "failed" ? (
            <button
              type="button"
              onClick={() => onRetry(selectedItem.localId)}
              aria-label="Retry upload"
              className="flex size-8 items-center justify-center rounded-full border border-white/60 bg-black/60 text-white shadow-lg shadow-black/25 backdrop-blur hover:bg-black/75"
            >
              <RotateCcw className="size-4" />
            </button>
          ) : null}
          {selectedItem && !readOnly && showPreviewActions ? (
            <button
              type="button"
              onClick={() => setItemToRemove(selectedItem)}
              aria-label="Remove media"
              className="flex size-8 items-center justify-center rounded-full border border-white/60 bg-black/60 text-white shadow-lg shadow-black/25 backdrop-blur hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="size-3.5" />
            </button>
          ) : null}
        </div>
        {items.length > 1 ? (
          <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center">
            <MediaCarouselDots
              items={items}
              selectedIndex={selectedIndex}
              onSelect={(dotIndex) => api?.scrollTo(dotIndex)}
            />
          </div>
        ) : null}
      </Carousel>
      <AlertDialog
        open={itemToRemove !== null}
        onOpenChange={(open) => {
          if (!open) {
            setItemToRemove(null);
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove media?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the media. You can add it again before saving if
              needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (itemToRemove) {
                  onRemove(itemToRemove.localId);
                }
                setItemToRemove(null);
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MediaCarouselDots({
  items,
  selectedIndex,
  onSelect,
}: {
  items: AssetUploadItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {items.map((item, index) => (
        <button
          key={item.localId}
          type="button"
          aria-label={`Go to media ${index + 1}`}
          onClick={() => onSelect(index)}
          className={cn(
            "size-1.5 rounded-full shadow-sm shadow-black/40 transition-colors",
            index === selectedIndex
              ? "bg-white"
              : "bg-white/45 hover:bg-white/75",
          )}
        />
      ))}
    </div>
  );
}

export function MediaPreviewSlide({
  item,
  readOnly,
  onAltChange,
  renderVideo,
  renderVideoPreview,
  renderVideoPlaceholder,
  videoPresentation,
  showPreviewDetails = true,
  previewDetailsVisibility = "always",
}: {
  item: AssetUploadItem;
  readOnly: boolean;
  onAltChange: (alt: string) => void;
  renderVideo?: MediaVideoRenderer;
  renderVideoPreview?: MediaVideoRenderer;
  renderVideoPlaceholder?: MediaVideoPlaceholderRenderer;
  videoPresentation: "full" | "compact";
  showPreviewDetails?: boolean;
  previewDetailsVisibility?: "always" | "hover-or-press";
}) {
  const [detailsOpen, setDetailsOpen] = React.useState(
    previewDetailsVisibility === "always",
  );
  const source = item.blobUrl ?? item.url;
  const fileName = item.fileName ?? item.file?.name ?? "Media";
  const hasActiveStatus =
    item.status === "hashing" ||
    item.status === "uploading" ||
    item.status === "processing" ||
    item.status === "failed";
  const detailsAreInteractive =
    showPreviewDetails && previewDetailsVisibility === "hover-or-press";
  const videoPlaceholder =
    item.kind === "video" &&
    (item.status === "processing" || item.status === "failed") &&
    !source &&
    renderVideoPlaceholder
      ? { item, state: item.status }
      : undefined;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: media preview owns pointer-type-aware disclosure while its nested player and form controls retain their native semantics
    <div
      className="overflow-hidden rounded-lg border bg-background"
      data-media-preview-details-open={detailsOpen}
      data-media-preview-details-visibility={previewDetailsVisibility}
      onPointerEnter={(event) => {
        if (detailsAreInteractive && event.pointerType === "mouse") {
          setDetailsOpen(true);
        }
      }}
      onPointerLeave={(event) => {
        if (detailsAreInteractive && event.pointerType === "mouse") {
          setDetailsOpen(false);
        }
      }}
      onPointerUp={(event) => {
        if (
          !detailsAreInteractive ||
          event.pointerType === "mouse" ||
          event.nativeEvent.composedPath().some((target) => {
            if (!(target instanceof Element)) {
              return false;
            }
            return target.matches(
              "button, input, textarea, select, a, [role='button'], [role='slider'], [data-media-preview-control]",
            );
          })
        ) {
          return;
        }
        setDetailsOpen((open) => !open);
      }}
      onFocusCapture={() => {
        if (detailsAreInteractive) {
          setDetailsOpen(true);
        }
      }}
      onKeyDown={(event) => {
        if (detailsAreInteractive && event.key === "Escape") {
          setDetailsOpen(false);
        }
      }}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        {videoPlaceholder && renderVideoPlaceholder ? (
          renderVideoPlaceholder({
            item: videoPlaceholder.item,
            state: videoPlaceholder.state,
            title: item.alt || fileName,
            className: "size-full object-cover",
            aspectRatio: "16 / 9",
          })
        ) : source || (item.kind === "video" && item.assetId) ? (
          item.kind === "video" ? (
            item.status === "uploaded" &&
            (videoPresentation === "compact"
              ? renderVideoPreview
              : renderVideo) ? (
              (videoPresentation === "compact"
                ? renderVideoPreview
                : renderVideo)?.({
                item,
                title: item.alt || fileName,
                className: "size-full object-cover",
                aspectRatio: "16 / 9",
              })
            ) : source ? (
              <video src={source} className="size-full object-cover" muted />
            ) : (
              <div className="flex size-full items-center justify-center">
                <Camera className="size-8 text-muted-foreground" />
              </div>
            )
          ) : item.kind === "audio" ? (
            <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
              <FileAudio2 className="size-8" aria-hidden="true" />
            </div>
          ) : (
            <img
              src={source}
              alt={item.alt || fileName}
              className="size-full object-cover"
            />
          )
        ) : (
          <div className="flex size-full items-center justify-center">
            <Camera className="size-8 text-muted-foreground" />
          </div>
        )}

        {item.status === "hashing" ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="size-6 animate-spin text-white" />
          </div>
        ) : null}
        {item.status === "failed" && !videoPlaceholder ? (
          <div className="absolute inset-0 flex items-center justify-center bg-destructive/50">
            <X className="size-6 text-white" />
          </div>
        ) : null}
        {item.status === "processing" && !videoPlaceholder ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/45">
            <Loader2 className="size-6 animate-spin text-white" />
          </div>
        ) : null}

        {showPreviewDetails || hasActiveStatus ? (
          <div
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-black/45 to-transparent px-3 pb-4 pt-12 text-white transition-opacity duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
              detailsAreInteractive &&
                !hasActiveStatus &&
                (detailsOpen ? "opacity-100" : "opacity-0"),
            )}
          >
            <div
              className={cn(
                "flex flex-col gap-2",
                detailsAreInteractive && !detailsOpen
                  ? "pointer-events-none"
                  : "pointer-events-auto",
              )}
            >
              {showPreviewDetails ? (
                <div
                  className={cn(
                    "flex flex-col gap-2",
                    detailsAreInteractive &&
                      hasActiveStatus &&
                      !detailsOpen &&
                      "invisible",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="min-w-0 truncate text-sm font-medium">
                      {fileName}
                    </p>
                    <p className="shrink-0 text-xs text-white/75">
                      {formatFileSize(item.size ?? item.file?.size ?? 0)}
                    </p>
                  </div>
                  {item.status === "uploaded" ? (
                    <input
                      type="text"
                      value={item.alt}
                      readOnly={readOnly}
                      onChange={(e) => onAltChange(e.target.value)}
                      placeholder="Alt text (required)"
                      className="h-8 rounded-md border border-white/25 bg-black/35 px-2 text-xs text-white placeholder:text-white/60 focus:outline-none focus:ring-1 focus:ring-white/80"
                    />
                  ) : null}
                </div>
              ) : null}

              {item.status === "hashing" ? (
                <p className="text-xs text-white/75">Preparing...</p>
              ) : null}
              {item.status === "failed" ? (
                <p className="text-xs text-destructive-foreground">
                  {item.error ?? "Failed"}
                </p>
              ) : null}
              {item.status === "uploading" ? (
                <div className="grid gap-1.5">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span>Uploading video…</span>
                    <span className="tabular-nums">
                      {Math.round(item.progress)}%
                    </span>
                  </div>
                  <Progress
                    value={item.progress}
                    aria-label={`Uploading video ${Math.round(item.progress)}%`}
                    className="[&_[data-slot=progress-track]]:bg-white/25"
                  />
                </div>
              ) : null}
              {item.status === "processing" ? (
                item.processingState === "transcoding" &&
                item.processingProgress !== undefined &&
                item.processingProgress >= 0 ? (
                  <div className="grid gap-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span>Transcoding video…</span>
                      <span className="tabular-nums">
                        {Math.round(item.processingProgress)}%
                      </span>
                    </div>
                    <Progress
                      value={item.processingProgress}
                      aria-label={`Transcoding video ${Math.round(item.processingProgress)}%`}
                      className="[&_[data-slot=progress-track]]:bg-white/25"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-white/75">Processing video…</p>
                )
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    TextareaField,
    TextareaGroupField,
    SelectField,
    ButtonGroupTextField,
    CheckboxField,
    OTPField,
    SplitTextField,
    RadioField,
    SwitchField,
    MarkdownEditorField,
    MediaField,
    RadioGroupInputField,
    TagsField,
    AsyncTagSelectField,
    DurationField,
    CalendarField,
  },
  formComponents: {
    // SubscribeButton,
  },
  fieldContext,
  formContext,
});
