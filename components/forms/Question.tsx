"use client";
import React, {  useState } from "react";
import { Editor } from '@tinymce/tinymce-react';
import { z } from "zod";
import { zodResolver} from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form";
import { QuestionSchema } from "@/lib/validations";
import Image from "next/image";
import { createQuestion, editQuestion } from "@/lib/actions/question.action";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeProvider";

interface Props {
  type?: string;
  mongoUserId: string;
  questionDetails?: string;
}

const Question = ({type, mongoUserId, questionDetails}: Props) => {
    const { mode } = useTheme();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const parsedQuestionDetails = JSON.parse(questionDetails || '');
    const groupedTags = parsedQuestionDetails.tags.map((tag: any) => tag.name);
    const form = useForm<z.infer<typeof QuestionSchema>>({
        resolver: zodResolver(QuestionSchema),
        defaultValues: {
          title: parsedQuestionDetails.title || "",
          explanation: parsedQuestionDetails.content || "",
          tags: groupedTags || [],
        },
      })
    const handleInputKeyDown =  (e: React.KeyboardEvent<HTMLInputElement>, field: any) => {
        if(e.key === "Enter" && field.name === 'tags') {
            e.preventDefault();
            const tagInput = e.target as HTMLInputElement;
            const tagValue = tagInput.value.trim();
            if(tagValue !== "") {
                if(tagValue.length > 15) {
                    return form.setError('tags', {
                        type: 'required',
                        message: 'Tag might be less than 15 characters'
                    })
                }
                if(!field.value.includes(tagValue as never)){
                    form.setValue('tags', [...field.value, tagValue]);
                    tagInput.value = '';
                    form.clearErrors('tags');
                }
            } else {
                form.trigger();
            }
        }
    } 
    const handleTagRemove = (tag: string, field: any) => {
        const newTags = field.value.filter((t: string) => t !== tag);
        form.setValue('tags', newTags);
    }
    async function onSubmit(values: z.infer<typeof QuestionSchema>) {
        setIsSubmitting(true);

        try {
          if(type === "Edit") {
            await editQuestion({
              questionId: parsedQuestionDetails._id,
              title: values.title,
              content: values.explanation,
              path: pathname
            })
            router.push(`/question/${parsedQuestionDetails._id}`);
          } else {
            await createQuestion({
              title: values.title,
              content: values.explanation,
              tags: values.tags,
              author: JSON.parse(mongoUserId),
              path: pathname,
            })
            router.push('/');
          };
        } catch (error){
          console.log(error);
        } finally {
            setIsSubmitting(false);
        }
      }
    return(<Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-10">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">Question Title<span className="text-primary-500">*</span></FormLabel>
                <FormControl className="mt-3.5">
                  <Input {...field} className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"/>
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Be specific and imagine you&apos;re asking a question to another person.
                </FormDescription>
                <FormMessage className="text-red-500"/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="explanation"
            render={( {field} ) => (
              <FormItem className="flex w-full flex-col gap-3">
                <FormLabel className="paragraph-semibold text-dark400_light800">Detailed explanation of your problem<span className="text-primary-500">*</span></FormLabel>
                <FormControl className="mt-3.5">
                    <Editor
                        apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                        initialValue={parsedQuestionDetails.content || ""}
                        init={{
                        height: 350,
                        value: field,
                        menubar: false,
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'codesample',
                        ],
                        toolbar: 'undo redo |' +
                            '| codesample | bold italic forecolor | alignleft aligncenter |' +
                            'alignright alignjustify | bullist numlist | ',
                        content_style: 'body { font-family:Inter; font-size:16px }',
                        skin: mode === 'dark' ? 'oxide-dark' : 'oxide',
                        content_css: mode === 'dark' ? 'dark' : 'light',
                        }} onEditorChange={(content) => field.onChange(content)}/>
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Introduce the problem and expand on what you put in the title. Minimum 20 characters.
                </FormDescription>
                <FormMessage className="text-red-500"/>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="paragraph-semibold text-dark400_light800">Tags<span className="text-primary-500">*</span></FormLabel>
                <FormControl className="mt-3.5">
                  <div>
                  <Input onKeyDown={(e) => {handleInputKeyDown(e, field)}} placeholder="Add tags..." disabled={type === "Edit"} className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"/>
                  {field?.value.length > 0 && (<div className="flex-start mt-2.5 gap-2.5">
                    {field.value.map((tag) => 
                        <div key={tag} onClick={() => type !== "Edit" ? handleTagRemove(tag, field) : () => {}} className="subtle-medium background-light800_dark300 text-light400_light500 flex items-center justify-center gap-2 rounded-md border-none px-4 py-2 capitalize">
                            {tag}
                            {type !== "Edit" && <Image src="/assets/icons/close.svg" height={12} width={12} alt="Close icon" className="cursor-pointer object-contain invert-0 dark:invert"/>}
                        </div>
                  )}</div>)}
                  </div>
                </FormControl>
                <FormDescription className="body-regular mt-2.5 text-light-500">
                  Add up to 3 tags to describe what your question is about. You need to press enter to add a tag.
                </FormDescription>
                <FormMessage className="text-red-500"/>
              </FormItem>
            )}
          />
          <Button type="submit" className="primary-gradient w-fit !text-light-900" disabled={isSubmitting}>{isSubmitting ? (
            <>
            {type === 'Edit' ? 'Editing...' : 'Posting...'}
            </>
          ) : (
            <>
            {type === 'Edit' ? 'Edit Question' : 'Ask a Question'}
            </>
          )}</Button>
        </form>
      </Form>)
}

export default Question;