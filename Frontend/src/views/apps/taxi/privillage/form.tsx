import React from 'react';

import type { SubmitHandler, UseFormProps, FieldValues } from 'react-hook-form';
import { useForm, FormProvider } from 'react-hook-form';

type FormProps<T extends FieldValues> = {
    onSubmit: SubmitHandler<T>;
    useFormProps?: UseFormProps<T>;
    children: React.ReactNode;
    className?: string;
};

export const Form = <T extends Record<string, any>>({
    onSubmit,
    useFormProps,
    children,
    className,
}: FormProps<T>) => {
    const methods = useForm<T>(useFormProps);

    return (
        <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} className={className}>
                {children}
            </form>
        </FormProvider>
    );
};

export default Form;
