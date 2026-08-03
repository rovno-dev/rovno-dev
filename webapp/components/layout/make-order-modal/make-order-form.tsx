// import { Text } from "@/components/core/data-display/typography/Text"
// import { TextField, Box, Button, Checkbox, FormHelperText } from "@mui/material";
// import { ROUTES } from "@/utils/constants/routes";
// import Link from "next/link";
// import CheckIcon from '@mui/icons-material/Check';
// import { TextLink } from "../core/data-display/typography/TextLink";
// import { useState, useRef } from "react";
// import z from "zod";
// import { colorStyles } from "@/utils/styles/colors";

// export default function MakeOrderForm() {
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

//   const topRef = useRef<HTMLDivElement>(null);
//   const [message, setMessage] = useState<string | undefined>(undefined);
//   const [loading, setLoading] = useState(false);
//   const [open, setOpen] = useState(false);

//   const formSchema = z.object({
//     companyName: z
//       .string(),
//     needsNaming: z
//       .boolean(),
//     description: z
//       .string()
//       .nonempty("Введите краткое описание"),
//     contacts: z
//       .string()
//       .nonempty("Укажите телефон или мессенджер"),
//     email: z
//       .email("Введите корректный email"),
//     name: z
//       .string()
//       .nonempty("Введите ваше имя")
//       .min(2, "Слишком короткое имя"),
//     agreement: z
//       .boolean()
//       .refine(val => val === true, {
//         message: "Дайте согласие на обработку ПД чтобы продолжить",
//       })
//   });

//   type FormValues = z.infer<typeof formSchema>;

//   const [values, setValues] = useState<FormValues>({
//     companyName: "",
//     needsNaming: false,
//     description: "",
//     contacts: "",
//     email: "",
//     name: "",
//     agreement: false,
//   });

//   const filled =
//     (values.companyName || values.needsNaming) &&
//     values.description &&
//     values.contacts &&
//     values.email &&
//     values.name &&
//     values.agreement &&
//     formSchema.safeParse(values).success;

//   const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>(
//     {}
//   );

//   function validateField<K extends keyof FormValues>(key: K, value: string | boolean) {
//     const result = formSchema.shape[key].safeParse(value);

//     setErrors((prev) => ({
//       ...prev,
//       [key]: result.success ? undefined : result.error.issues[0].message,
//     }));
//   }

//   function handleChange<K extends keyof FormValues>(key: K) {
//     return (e: React.ChangeEvent<HTMLInputElement>) => {
//       const value = e.target.value;
//       setValues((prev) => ({ ...prev, [key]: value }));
//     };
//   }

//   function handleBlur<K extends keyof FormValues>(key: K) {
//     return () => {
//       validateField(key, values[key]);
//     };
//   }

//   function handleSubmit() {
//     const result = formSchema.safeParse(values);

//     if (!result.success) {
//       const fieldErrors: Partial<Record<keyof FormValues, string>> = {};

//       result.error.issues.forEach((issue) => {
//         const fieldName = issue.path[0] as keyof FormValues;
//         fieldErrors[fieldName] = issue.message;
//       });

//       setErrors(fieldErrors);
//       topRef.current?.scrollIntoView({ behavior: 'smooth' }); 
//       return;
//     }

//     makeOrder();
//   }

//   async function makeOrder() {
//     const response = await fetch(`${BASE_URL}/api/orders/v0/create`, {
//       method: "POST",
//       headers: {
//         "Accept-Language": "ru"
//       },
//       body: JSON.stringify({
//         company_name: values.companyName,
//         needs_naming: values.needsNaming,
//         short_description: values.description,
//         contacts: values.contacts,
//         email: values.email,
//         name: values.name,
//         agreed_to_share_personal_data: values.agreement ? values.agreement : true,
//       }),
//     });
//     const data = await response.json();
//     if (response.ok) {
//       // TODO: add confetti effect
//       setMessage("🎉 Заказ оформлен!");
//       setOpen(true);
//       setTimeout(() => window.location.reload(), 6000)
//     } else {
//       if (response.status === 422) {
//         setErrors(data.errors)
//       } else {
//         setMessage("😢 Ошибка при создании заказа");
//         setOpen(true);
//       }
//     }
//   }

//   return (
//     <>
//     <div ref={topRef} />
//       <div className="flex flex-col gap-[1.5rem]">
//         <div className="flex flex-col gap-[0.75rem]">
//           <TextField
//             fullWidth
//             variant="standard"
//             id="companyName"
//             label="Название компании/проекта"
//             value={values.companyName}
//             onChange={handleChange("companyName")}
//             onBlur={handleBlur("companyName")}
//             error={!!errors.companyName}
//             helperText={errors.companyName}
//             {...(values.needsNaming ? { disabled: true } : {})}
//           />
//           <div className={`flex items-center gap-[0.75rem] ${values.companyName ? `cursor-not-allowed` : ''}`}>
//             <Checkbox
//               name="needsNaming"
//               onChange={(event) => setValues({ ...values, [event.target.name]: event.target.checked })}
//               onBlur={handleBlur("needsNaming")}
//               sx={{ padding: 0 }}
//               {...(values.companyName.length > 0 ? { disabled: true } : {})}
//             />
//             <Text
//               component={'span'}
//               variant="secondary"
//               {...(values.companyName ? { color: colorStyles['dark'].text.muted.default } : {})}
//             >
//               Нужно придумать название
//             </Text>
//           </div>
//         </div>

//         <TextField
//           fullWidth
//           variant="standard"
//           id="description"
//           label="Расскажите кратко о проекте"
//           value={values.description}
//           onChange={handleChange("description")}
//           onBlur={handleBlur("description")}
//           error={!!errors.description}
//           helperText={errors.description}
//         />

//         <TextField
//           fullWidth
//           variant="standard"
//           id="contacts"
//           label="Телефон или мессенджер"
//           value={values.contacts}
//           onChange={handleChange("contacts")}
//           onBlur={handleBlur("contacts")}
//           error={!!errors.contacts}
//           helperText={errors.contacts}
//         />

//         <TextField
//           fullWidth
//           variant="standard"
//           id="email"
//           label="Email"
//           value={values.email}
//           onChange={handleChange("email")}
//           onBlur={handleBlur("email")}
//           error={!!errors.email}
//           helperText={errors.email}
//         />

//         <TextField
//           fullWidth
//           variant="standard"
//           id="name"
//           label="Ваше имя"
//           value={values.name}
//           onChange={handleChange("name")}
//           onBlur={handleBlur("name")}
//           error={!!errors.name}
//           helperText={errors.name}
//         />
//         {/* <TextField
//                 fullWidth
//                 variant="standard"
//                 id="description"
//                 label="Доп. файлы (до 15мб.)"
//                 value={files}
//                 onChange={(e) => setFiles(e.target.value)}
//               /> */}
//         <div className="flex flex-col gap-[0.25rem]">
//           <div className="flex items-center gap-[1rem]">
//             <Checkbox
//               name="agreement"
//               onChange={(event) => setValues({ ...values, [event.target.name]: event.target.checked })}
//               onBlur={handleBlur("agreement")}
//               sx={{ padding: 0 }}
//             />
//             <Text component={'span'}>
//               Даю согласие на обработку моих{" "}
//               <TextLink
//                 color={colorStyles.dark.text.link.default}
//                 href={ROUTES.personalDataAgreement.href}
//               >
//                 персональных данных
//               </TextLink>
//             </Text>
//           </div>

//           {errors.agreement && (
//             <FormHelperText error sx={{ marginLeft: "2rem" }}>
//               {errors.agreement}
//             </FormHelperText>
//           )}
//         </div>
//       </div>
//       <Button
//         sx={{
//           marginTop: '2.5rem',
//           /* position: "sticky",
//           bottom: "20px",
//           left: 0, */
//         }}
//         size="large"
//         fullWidth
//         startIcon={filled && <CheckIcon />}
//         autoFocus
//         {...(filled ? {} : { disabled: true })}
//         loading={loading}
//         onClick={handleSubmit}
//         variant="contained"
//       >
//         Оформить заказ
//       </Button>
//     </>
//   )
// }