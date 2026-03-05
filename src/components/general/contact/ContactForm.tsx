"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PhoneInput from "@/components/forms/PhoneInput";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ContactFormData, createContactSchema } from "@/lib/schemas";
import { contactUsAction } from "@/actions/websiteActions";

const ContactForm: React.FC = () => {
  const t = useTranslations("contact");
  const [successMessage, setSuccessMessage] = useState("");

  const locale = useLocale();
  const formSchema = createContactSchema(locale as "ar" | "en");

  const form = useForm<ContactFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const mutation = useMutation<
    any, // success response
    {
      errors?: Partial<Record<keyof ContactFormData, string[]>>;
      message?: string;
    },
    ContactFormData
  >({
    mutationFn: (data) => contactUsAction(data),
    onSuccess: () => {
      setSuccessMessage(t("form.success.message"));
      form.reset();
    },
    onError: (error) => {
      setSuccessMessage("");
      // Field-level errors
      Object.entries(error.errors || {}).forEach(([key, messages]) => {
        form.setError(key as keyof ContactFormData, {
          type: "server",
          message: messages?.[0],
        });
      });

      // Fallback general error
      if (!error.errors) {
        form.setError("root", {
          type: "server",
          message: error.message || "حدث خطأ ما",
        });
      }
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.name.label")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("form.name.placeholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.email.label")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("form.email.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.phone.label")}</FormLabel>
                <FormControl>
                  <PhoneInput
                    {...field}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.subject.label")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t("form.subject.placeholder")}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="استفسار">
                      {t("form.subject.options.inquiry")}
                    </SelectItem>
                    <SelectItem value="شكوى">
                      {t("form.subject.options.complaint")}
                    </SelectItem>
                    <SelectItem value="اقتراح">
                      {t("form.subject.options.suggestion")}
                    </SelectItem>
                    <SelectItem value="أخرى">
                      {t("form.subject.options.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.message.label")}</FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-44"
                    rows={5}
                    placeholder={t("form.message.placeholder")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <p className="text-destructive text-sm font-medium text-center">
              {form.formState.errors.root.message}
            </p>
          )}

          {successMessage && (
            <p className="text-green-600 text-sm font-medium text-center">
              {successMessage}
            </p>
          )}

          <Button
            size={"sm"}
            type="submit"
            className="w-fit justify-self-end"
            disabled={mutation.isPending}
          >
            {mutation.isPending
              ? t("form.button.loading")
              : t("form.button.label")}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ContactForm;
