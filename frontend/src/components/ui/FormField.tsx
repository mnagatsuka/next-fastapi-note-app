import React from "react";

interface FormFieldProps {
	label: string;
	id: string;
	type?: "text" | "email" | "url";
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	required?: boolean;
	maxLength?: number;
	helperText?: string;
	error?: string;
}

export function FormField({
	label,
	id,
	type = "text",
	value,
	onChange,
	placeholder,
	disabled = false,
	required = false,
	maxLength,
	helperText,
	error,
}: FormFieldProps) {
	return (
		<div className="space-y-2">
			<label htmlFor={id} className="text-sm font-medium">
				{label}
				{required && <span className="text-destructive ml-1">*</span>}
			</label>

			<input
				id={id}
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent ${
					error ? "border-destructive focus:ring-destructive" : "border-border"
				}`}
				placeholder={placeholder}
				disabled={disabled}
				required={required}
				maxLength={maxLength}
			/>

			{maxLength && (
				<div className="text-xs text-muted-foreground">
					{value.length}/{maxLength} characters
				</div>
			)}

			{error && <div className="text-xs text-destructive">{error}</div>}

			{helperText && !error && (
				<div className="text-xs text-muted-foreground">{helperText}</div>
			)}
		</div>
	);
}
