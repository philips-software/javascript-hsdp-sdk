import { z } from 'zod';

export const parsedZDate = z.preprocess((arg) => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
}, z.date());

export const scimResource = z.object({
  schemas: z.array(z.string()),
  id: z.string(),
  meta: z
    .object({
      resourceType: z.string().optional(),
      created: parsedZDate,
      lastModified: parsedZDate,
      version: z.string(),
      location: z.string().optional(),
    })
    .optional(),
});

export type ScimResource = z.infer<typeof scimResource>;

export const scimReference = z.object({
  value: z.string(),
  primary: z.boolean().optional(),
});

export type ScimReference = z.infer<typeof scimReference>;

const scimListResponseBase = z.object({
  schemas: z.array(z.string()),
  totalResults: z.number(),
  startIndex: z.number(),
  itemsPerPage: z.number(),
});

export const scimListResponse = <T extends z.ZodTypeAny>(schema: T) =>
  scimListResponseBase.merge(
    z.object({
      Resources: z.array(schema),
    }),
  );
