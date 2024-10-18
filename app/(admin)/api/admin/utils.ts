import type {
  GetNextAdminPropsParams,
  MainLayoutProps,
  NextAdminOptions,
  Field,
  NextAdminContext,
} from "@premieroctet/next-admin";
import type { Prisma, PrismaClient } from "@prisma/client/edge";
import React from "react";

export type GetMainLayoutPropsParams = Omit<
  GetNextAdminPropsParams,
  "schema" | "searchParams" | "prisma"
> & {
  models?: readonly Prisma.DMMF.Model[];
};

export type DeepIncludeRecord = Record<string, true | unknown>;

// @ts-expect-error - Just a missing type, TODO: fix this later
export type ModelIcon = NextAdminOptions["model"]["icon"];

export type Payload = Prisma.TypeMap["model"][Prisma.ModelName]["payload"];

export type ModelFromPayload<
  P extends Payload,
  T extends object | number = object
> = {
  [Property in keyof P["scalars"]]: P["scalars"][Property];
} &
  {
    [Property in keyof P["objects"]]: P["objects"][Property] extends {
      scalars: infer S;
    }
      ? T extends object
        ? S
        : T
      : never | P["objects"][Property] extends { scalars: infer S }[]
      ? T extends object
        ? S[]
        : T[]
      : never | P["objects"][Property] extends { scalars: infer S } | null
      ? T extends object
        ? S | null
        : T | null
      : never;
  };

export type Model<
  M extends Prisma.ModelName,
  T extends object | number = object
> = ModelFromPayload<Prisma.TypeMap["model"][M]["payload"], T>;

export type GetMappedDataListParams = {
  models: readonly Prisma.DMMF.Model[];
  prisma: PrismaClient;
  resource: Prisma.ModelName;
  options?: NextAdminOptions;
  searchParams: URLSearchParams;
  context: NextAdminContext;
  appDir?: boolean;
};

export const capitalize = <T extends string>(str: T): Capitalize<T> => {
  const capitalizedStr = str.charAt(0).toLocaleUpperCase() + str.slice(1);
  return capitalizedStr as Capitalize<T>;
};

export const uncapitalize = <T extends string>(str: T): Uncapitalize<T> => {
  const uncapitalizedStr = str.charAt(0).toLocaleLowerCase() + str.slice(1);
  return uncapitalizedStr as Uncapitalize<T>;
};

export const findRelationInData = (
  models: readonly Prisma.DMMF.Model[],
  data: Record<string, unknown>[],
  dmmfSchema?: readonly Prisma.DMMF.Field[]
) => {
  dmmfSchema?.forEach((dmmfProperty) => {
    const dmmfPropertyName = dmmfProperty.name;
    const dmmfPropertyType = dmmfProperty.type;
    const dmmfPropertyKind = dmmfProperty.kind;
    const dmmfPropertyRelationFromFields = dmmfProperty.relationFromFields;
    const dmmfPropertyRelationToFields = dmmfProperty.relationToFields;

    if (dmmfPropertyKind === "object") {
      /**
       * Handle one-to-one relation
       * Make sure that we are in a relation that is not a list
       * because one side of a one-to-one relation will not have relationFromFields
       */
      if (
        (dmmfPropertyRelationFromFields?.length &&
          dmmfPropertyRelationToFields?.length) ||
        !dmmfProperty.isList
      ) {
        const idProperty = getModelIdProperty(
          models,
          dmmfProperty.type as Prisma.ModelName
        );
        data.forEach((item) => {
          if (item[dmmfPropertyName]) {
            item[dmmfPropertyName] = {
              type: "link",
              value: {
                label: item[dmmfPropertyName],
                url: `${dmmfProperty.type as Prisma.ModelName}/${
                  // @ts-expect-error - no way to type further than this
                  item[dmmfPropertyName][idProperty]
                }`,
              },
            };
          }
          return item;
        });
      } else {
        data.forEach((item) => {
          if (item[dmmfPropertyName]) {
            item[dmmfPropertyName] = {
              type: "count",
              // @ts-expect-error - no way to type further than this
              value: item[dmmfPropertyName].length,
            };
          }
          return item;
        });
      }
    }

    if (["scalar", "enum"].includes(dmmfPropertyKind) && dmmfProperty.isList) {
      data.forEach((item) => {
        if (item[dmmfPropertyName]) {
          item[dmmfPropertyName] = {
            type: "count",
            // @ts-expect-error - no way to type further than this
            value: item[dmmfPropertyName].length,
          };
        }
        return item;
      });
    }

    if (
      dmmfPropertyType === "DateTime" ||
      dmmfPropertyType === "Decimal" ||
      dmmfPropertyType === "BigInt"
    ) {
      data.forEach((item) => {
        if (item[dmmfProperty.name]) {
          if (dmmfPropertyType === "DateTime") {
            item[dmmfProperty.name] = {
              type: "date",
              // @ts-expect-error - no way to type further than this
              value: item[dmmfProperty.name].toISOString(),
            };
          } else if (dmmfPropertyType === "Decimal") {
            item[dmmfProperty.name] = Number(item[dmmfProperty.name]);
          } else if (dmmfPropertyType === "BigInt") {
            item[dmmfProperty.name] = BigInt(
              // @ts-expect-error - no way to type further than this
              item[dmmfProperty.name]
            ).toString();
          }
        } else {
          return item;
        }
      });
    }
  });
  return data;
};

export const mapDataList = ({
  models,
  context,
  appDir,
  fetchData,
  ...args
}: Pick<
  GetMappedDataListParams,
  "resource" | "options" | "context" | "appDir" | "models"
> & { fetchData: never[] }) => {
  const { resource, options } = args;
  const dmmfSchema = getPrismaModelForResource(models, resource);
  const data = findRelationInData(models, fetchData, dmmfSchema?.fields);
  const listFields = options?.model?.[resource]?.list?.fields ?? {};
  const originalData = [...data];
  data.forEach((item, index) => {
    context.row = originalData[index];
    Object.keys(item).forEach((key) => {
      let itemValue = null;
      const model = capitalize(key) as Prisma.ModelName;
      const idProperty = getModelIdProperty(models, model);
      if (typeof item[key] === "object" && item[key] !== null) {
        // @ts-expect-error - no way to type further than this
        switch (item[key].type) {
          case "link":
            // @ts-expect-error - no way to type further than this
            itemValue = item[key].value.label;
            break;
          case "count":
            // @ts-expect-error - no way to type further than this
            itemValue = item[key].value;
            break;
          case "date":
            // @ts-expect-error - no way to type further than this
            itemValue = item[key].value.toString();
            break;
          default:
            // @ts-expect-error - no way to type further than this
            itemValue = item[key][idProperty];
            break;
        }

        // @ts-expect-error - no way to type further than this
        item[key].__nextadmin_formatted = itemValue;
      } else if (isScalar(item[key]) && item[key] !== null) {
        item[key] = {
          type: "scalar",
          value: item[key],
          __nextadmin_formatted: item[key].toString(),
        };
        // @ts-expect-error - no way to type further than this
        itemValue = item[key].value;
      }

      if (
        appDir &&
        key in listFields &&
        listFields[key as Field<Prisma.ModelName>]?.formatter &&
        itemValue !== null
      ) {
        // @ts-expect-error - no way to type further than this
        item[key].__nextadmin_formatted = listFields[
          key as Field<Prisma.ModelName>
          // @ts-expect-error - no way to type further than this
        ]?.formatter?.(itemValue ?? item[key], context);
      } else {
        // @ts-expect-error - no way to type further than this
        if (typeof item[key]?.__nextadmin_formatted === "object") {
          // @ts-expect-error - no way to type further than this
          item[key].__nextadmin_formatted =
            // @ts-expect-error - no way to type further than this
            item[key].__nextadmin_formatted[idProperty];
        }
        data[index][key] = item[key];
      }

      // @ts-expect-error - no way to type further than this
      if (typeof item[key]?.value === "object") {
        // @ts-expect-error - no way to type further than this
        item[key].value.label = item[key].value.label[idProperty];
      }
    });
  });
  return data;
};

export const modelHasIdField = (
  models: readonly Prisma.DMMF.Model[],
  model: Prisma.ModelName
) => {
  const prismaModel = models.find((m) => m.name === model);
  return !!prismaModel?.fields.some((f) => f.isId);
};

export const getModelIdProperty = (
  models: readonly Prisma.DMMF.Model[],
  model: Prisma.ModelName
) => {
  const prismaModel = models.find((m) => m.name === model);
  const idField = prismaModel?.fields.find((f) => f.isId);
  return idField?.name ?? "id";
};

export const getResourceFromParams = (
  params: string[],
  resources: Prisma.ModelName[]
) => {
  return resources.find((r) => {
    const slugifiedResource = r.toLowerCase();
    return params.some((param) => param.toLowerCase() === slugifiedResource);
  });
};

export const getPrismaModelForResource = (
  models: readonly Prisma.DMMF.Model[],
  resource: Prisma.ModelName
): Prisma.DMMF.Model | undefined =>
  models.find((datamodel) => datamodel.name === resource);

export const getResources = (
  options?: NextAdminOptions
): Prisma.ModelName[] => {
  return options?.model
    ? (Object.keys(options.model) as Prisma.ModelName[])
    : [];
};

export const isScalar = (
  value: unknown
): value is string | boolean | number => {
  return (
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  );
};

export const extractSerializable = <T>(obj: T, isAppDir?: boolean): T => {
  if (Array.isArray(obj)) {
    return (obj.map((item) =>
      extractSerializable(item, isAppDir)
    ) as unknown) as T;
  } else if (obj === null) {
    return obj;
  } else if (typeof obj === "object") {
    if (isAppDir && React.isValidElement(obj)) {
      return obj;
    }
    let newObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj = {
          ...newObj,
          [key]: extractSerializable(obj[key], isAppDir),
        };
      }
    }
    return newObj;
  } else if (isScalar(obj)) {
    return obj;
  } else {
    return (undefined as unknown) as T;
  }
};

export const getMainLayoutProps = ({
  basePath,
  apiBasePath,
  options,
  params,
  models = [],
}: GetMainLayoutPropsParams): MainLayoutProps => {
  if (params !== undefined && !Array.isArray(params)) {
    throw new Error(
      "`params` parameter in `getMainLayoutProps` should be an array of strings."
    );
  }

  const resources = getResources(options);
  const resource = getResourceFromParams(params ?? [], resources);
  const dmmfSchema = getPrismaModelForResource(models, resource!);
  const resourcesIdProperty = resources!.reduce((acc, resource) => {
    acc[resource] = getModelIdProperty(models, resource);
    return acc;
  }, {} as Record<Prisma.ModelName, string>);

  const customPages = Object.keys(options?.pages ?? {}).map((path) => ({
    title: options?.pages![path as keyof typeof options.pages].title ?? path,
    path: path,
    icon: options?.pages![path as keyof typeof options.pages].icon,
  }));

  const resourcesTitles = resources.reduce((acc, resource) => {
    acc[resource as Prisma.ModelName] =
      options?.model?.[resource as keyof typeof options.model]?.title ??
      resource;
    return acc;
  }, {} as { [key in Prisma.ModelName]: string });

  const resourcesIcons = resources.reduce((acc, resource) => {
    if (!options?.model?.[resource as keyof typeof options.model]?.icon)
      return acc;
    acc[resource as Prisma.ModelName] =
      options.model?.[resource as keyof typeof options.model]?.icon;
    return acc;
  }, {} as { [key in Prisma.ModelName]: ModelIcon });

  return {
    resources,
    resource,
    basePath,
    apiBasePath,
    customPages,
    resourcesTitles,
    isAppDir: true,
    title: options?.title ?? "Admin",
    sidebar: options?.sidebar,
    resourcesIcons,
    externalLinks: options?.externalLinks,
    options: options,
    dmmfSchema: dmmfSchema?.fields,
    resourcesIdProperty: resourcesIdProperty,
  };
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const isNativeFunction = (fn: Function) => {
  return /\{\s*\[native code\]\s*\}/.test(fn.toString());
};

export const getToStringForModel = <M extends Prisma.ModelName>(
  options: Required<NextAdminOptions>["model"][M]
): ((item: Model<M>) => string) | undefined => {
  const nonCheckedToString = options?.toString;
  const toStringForRelations =
    nonCheckedToString && !isNativeFunction(nonCheckedToString)
      ? nonCheckedToString
      : undefined;
  return toStringForRelations;
};

export const preparePrismaListRequest = ({
  searchParams,
}: {
  resource: Prisma.ModelName;
  searchParams: URLSearchParams;
  options?: NextAdminOptions;
  skipFilters?: boolean;
}) => {
  const page = Number(searchParams.get("page")) || 1;
  const itemsPerPage = Number(searchParams.get("itemsPerPage")) || 10;

  return {
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
  };
};

export const formatId = (
  models: readonly Prisma.DMMF.Model[],
  resource: Prisma.ModelName,
  id: string
) => {
  const model = models.find((model) => model.name === resource);
  const idProperty = getModelIdProperty(models, resource);

  return model?.fields?.find((field) => field.name === idProperty)?.type ===
    "Int"
    ? Number(id)
    : id;
};

export const getResourceIdFromParam = (
  models: readonly Prisma.DMMF.Model[],
  param: string,
  resource: Prisma.ModelName
) => {
  if (param === "new") {
    return undefined;
  }
  const idProperty = formatId(models, resource, param);
  return typeof idProperty === "number" && isNaN(idProperty)
    ? undefined
    : idProperty;
};

export const includeDataByDepth = <M extends Prisma.ModelName>(
  models: readonly Prisma.DMMF.Model[],
  model: Prisma.DMMF.Model,
  currentDepth: number,
  maxDepth: number
) => {
  const include = model?.fields.reduce((acc, field) => {
    if (field.kind === "object") {
      /**
       * We substract because, if the condition matches,
       * we will have all the fields in the related model, which are
       * counted in currentDepth + 1
       */
      if (currentDepth < maxDepth - 1) {
        acc[field.name] = {
          include: includeDataByDepth(
            models,
            getPrismaModelForResource(models, field.type as M)!,
            currentDepth + 1,
            maxDepth
          ),
        };
      } else {
        acc[field.name] = true;
      }
    }
    return acc;
  }, {} as DeepIncludeRecord);

  return include;
};
