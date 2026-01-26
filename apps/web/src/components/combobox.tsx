import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

interface DataItem {
	id?: string;
	value?: string;
	name: string;
}

interface SelectPillsProps {
	data: DataItem[];
	defaultValue?: string[];
	value?: string[];
	onValueChange?: (selectedValues: string[]) => void;
	placeholder?: string;
}

export function SelectPills({
	data,
	defaultValue = [],
	value: controlledValue,
	onValueChange,
	placeholder = "Select items...",
}: SelectPillsProps) {
	const [open, setOpen] = React.useState(false);

	// Handle controlled vs uncontrolled state
	const [internalValue, setInternalValue] =
		React.useState<string[]>(defaultValue);

	const selectedValues = controlledValue ?? internalValue;

	const handleSelect = (itemValue: string) => {
		const newValues = selectedValues.includes(itemValue)
			? selectedValues.filter((v) => v !== itemValue)
			: [...selectedValues, itemValue];

		if (controlledValue === undefined) {
			setInternalValue(newValues);
		}

		onValueChange?.(newValues);
	};

	const handleClear = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (controlledValue === undefined) {
			setInternalValue([]);
		}
		onValueChange?.([]);
	};

	// Helper to get consistent value from DataItem
	const getItemValue = (item: DataItem) => item.value || item.id || item.name;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<div
					role="combobox"
					aria-expanded={open}
					className={cn(
						"flex min-h-10 w-full cursor-pointer items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors hover:bg-accent/10",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						selectedValues.length > 0 ? "h-auto" : "h-10",
					)}
					onClick={() => setOpen(!open)}
				>
					<div className="flex flex-wrap gap-1.5">
						{selectedValues.length > 0 ? (
							selectedValues.map((val) => {
								const item = data.find((d) => getItemValue(d) === val);
								if (!item) return null;
								return (
									<Badge
										key={val}
										variant="secondary"
										className="flex items-center gap-1 rounded-sm px-1 font-normal"
										onClick={(e) => {
											e.stopPropagation();
											handleSelect(val);
										}}
									>
										{item.name}
										<div className="ml-1 rounded-full p-0.5 outline-none hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground">
											<X className="h-3 w-3" />
										</div>
									</Badge>
								);
							})
						) : (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
					</div>
					<div className="flex shrink-0 items-center gap-1 text-muted-foreground overflow-auto max-h-5">
						{selectedValues.length > 0 && (
							<div
								onClick={handleClear}
								className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-muted hover:text-foreground"
								title="Limpar tudo"
							>
								<X className="h-3 w-3" />
							</div>
						)}
						<ChevronsUpDown className="h-4 w-4 opacity-50" />
					</div>
				</div>
			</PopoverTrigger>
			<PopoverContent
				className="w-[var(--radix-popover-trigger-width)] p-0"
				align="start"
			>
				<Command>
					<CommandInput placeholder={placeholder} />
					<CommandList>
						<CommandEmpty>No results found.</CommandEmpty>
						<CommandGroup className="max-h-64 overflow-auto">
							{data.map((item) => {
								const itemVal = getItemValue(item);
								const isSelected = selectedValues.includes(itemVal);
								return (
									<CommandItem
										key={itemVal}
										value={item.name} // Filter by name
										onSelect={() => handleSelect(itemVal)}
									>
										<div
											className={cn(
												"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<Check className={cn("h-4 w-4")} />
										</div>
										{item.name}
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedValues.length > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => {
											if (controlledValue === undefined) setInternalValue([]);
											onValueChange?.([]);
										}}
										className="justify-center text-center"
									>
										Limpar seleção
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
