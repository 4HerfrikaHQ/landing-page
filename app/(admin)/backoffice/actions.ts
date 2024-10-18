"use server";

import { Prisma } from "@prisma/client/edge";
import type { PrismaClient } from "@prisma/client/edge";
import type {
  AdminComponentProps,
  // EditOptions,
  ModelAction,
  NextAdminOptions,
  OutputModelAction,
  PageProps,
} from "@premieroctet/next-admin";
import { prisma } from "@/prisma";
import schema from "@/prisma/json-schema/json-schema.json";
import { options, apiBasePath, basePath } from "./options";
import {
  extractSerializable,
  getMainLayoutProps,
  GetMappedDataListParams,
  getModelIdProperty,
  getPrismaModelForResource,
  getResourceIdFromParam,
  includeDataByDepth,
  // getToStringForModel,
  mapDataList,
  Model,
  preparePrismaListRequest,
  uncapitalize,
} from "../api/admin/utils";

type FetchDataListParams = {
  prisma: PrismaClient;
  resource: Prisma.ModelName;
  options?: NextAdminOptions;
  searchParams: URLSearchParams;
};

export const fetchDataList = async (
  { prisma, resource, options, searchParams }: FetchDataListParams,
  skipFilters: boolean = false
) => {
  const prismaListRequest = preparePrismaListRequest({
    resource,
    searchParams,
    options,
    skipFilters,
  });
  let data: unknown[] = [];
  let total: number;
  let error: string | null = null;

  try {
    data = await prisma[uncapitalize(resource)].findMany(prismaListRequest);
    total = await prisma[uncapitalize(resource)].count({
      // where: prismaListRequest.where,
    });
  } catch (e) {
    const { skip, take } = prismaListRequest;
    data = await prisma[uncapitalize(resource)].findMany({
      skip,
      take,
      // orderBy,
    });
    total = await prisma[uncapitalize(resource)].count();
    // @ts-expect-error - error message
    error = e.message ? e.message : e;
    console.error(e);
  }
  return {
    data,
    total,
    error,
  };
};

export const getMappedDataList = async ({
  context,
  appDir = false,
  ...args
}: GetMappedDataListParams) => {
  const { data, total, error } = await fetchDataList(args);
  const fetchData = data as never[];

  return {
    data: mapDataList({ context, appDir, fetchData, ...args }),
    total,
    error,
  };
};

export const getPropsFromParams = async ({
  params,
  searchParams,
}: {
  params: string | string[];
  searchParams: PageProps["searchParams"];
}): Promise<
  | AdminComponentProps
  | Omit<AdminComponentProps, "dmmfSchema" | "schema" | "resource" | "action">
  | Pick<
      AdminComponentProps,
      | "pageComponent"
      | "basePath"
      | "apiBasePath"
      | "isAppDir"
      | "message"
      | "resources"
      | "error"
    >
> => {
  if (params !== undefined && !Array.isArray(params)) {
    throw new Error(
      "`params` parameter in `getMainLayoutProps` should be an array of strings."
    );
  }
  const { models } = Prisma.dmmf.datamodel;
  const baseProps = getMainLayoutProps({
    basePath,
    apiBasePath,
    options,
    params,
    models,
  });

  if (!params) return baseProps;

  const { resource } = baseProps;
  if (!resource) return baseProps;

  // We don't need to pass the action function and canExecute to the component
  const actions = options?.model?.[resource]?.actions?.map((action) => {
    // @ts-expect-error action is not a valid prop
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { action: _1, canExecute: _2, ...actionRest } = action;
    return actionRest;
  });

  switch (params.length) {
    case 1: {
      const { data, total, error } = await getMappedDataList({
        models,
        prisma,
        resource,
        options,
        searchParams: new URLSearchParams(
          searchParams as Record<string, string>
        ),
        context: { locale: "en" },
        appDir: true,
      });

      const dataIds = data.map(
        // @ts-expect-error - no further typing can be done
        (item) => item[getModelIdProperty(models, resource)].value
      );

      const fullfilledAction = await getEnableToExecuteActions<typeof resource>(
        models,
        resource,
        prisma,
        dataIds,
        actions as ModelAction<typeof resource>[]
      );

      const serializedActions = extractSerializable(fullfilledAction, true);

      // const verifiedAction = actions?.map((action) => {
      //   action.canExecute = action.canExecute ?? (() => true);
      // });

      return {
        ...baseProps,
        resource,
        // @ts-expect-error - no further typing can be done
        data,
        total,
        error: error ?? (searchParams?.error as string),
        // @ts-expect-error - schema types are not compatible
        schema,
        actions: serializedActions,
      };
    }
    case 2: {
      const resourceId = getResourceIdFromParam(models, params[1], resource);

      const dmmfSchema = getPrismaModelForResource(models, resource);
      // const edit = options?.model?.[resource]?.edit as EditOptions<
      //   typeof resource
      // >;

      // let deepCopySchema = await transformSchema(
      //   resource,
      //   edit,
      //   options
      // )(cloneDeep(schema));
      // const customInputs = getCustomInputs(resource, options);

      if (resourceId !== undefined) {
        //   const data = await getDataItem({
        //     prisma,
        //     resource,
        //     resourceId,
        //     options,
        //     locale: "en",
        //     isAppDir: true,
        //   });

        //   const toStringFunction = getToStringForModel(
        //     options?.model?.[resource]
        //   );
        //   const slug = toStringFunction
        //     ? toStringFunction(data)
        //     : resourceId.toString();

        //   // applyVisiblePropertiesInSchema(resource, edit, data, deepCopySchema);

        //   const dataId = data[getModelIdProperty(models, resource)];

        //   const fullfilledAction = await getEnableToExecuteActions<
        //     typeof resource
        //   >(
        //     resource,
        //     prisma,
        //     [dataId],
        //     actions as ModelAction<typeof resource>[]
        //   );

        //   const serializedActions = extractSerializable(fullfilledAction, true);

        return {
          ...baseProps,
          resource,
          // data,
          // slug,
          // @ts-expect-error - no further typing can be done
          schema,
          dmmfSchema: dmmfSchema?.fields,
          // customInputs,
          // actions: serializedActions,
        };
      }

      if (params[1] === "new") {
        return {
          ...baseProps,
          resource,
          // @ts-expect-error - no further typing can be done
          schema,
          dmmfSchema: dmmfSchema?.fields,
          // customInputs,
        };
      }
      return baseProps;
    }
    default:
      return baseProps;
  }
};

export const getEnableToExecuteActions = async <M extends Prisma.ModelName>(
  models: readonly Prisma.DMMF.Model[],
  resource: M,
  prisma: PrismaClient,
  ids: string[] | number[],
  actions?: Omit<ModelAction<M>, "action">[]
): Promise<OutputModelAction | undefined> => {
  if (actions?.some((action) => action.canExecute)) {
    const maxDepth = Math.max(0, ...actions.map((action) => action.depth ?? 0));

    const data: Model<typeof resource>[] = await getRawData<typeof resource>({
      models,
      prisma,
      resource,
      resourceIds: ids,
      // Apply the default value if its 0
      maxDepth: maxDepth || undefined,
    });

    return actions?.reduce(async (acc, action) => {
      const accResolved = await acc;
      const { canExecute, ...restAction } = action;
      if (canExecute) {
        const allowedIds = data
          .filter((item) =>
            (canExecute as (item: Model<typeof resource>) => boolean)(item)
          )
          .map(
            (item) =>
              item[
                getModelIdProperty(models, resource) as keyof Model<
                  typeof resource
                >
              ]
          ) as string[] | number[];

        accResolved.push({ ...restAction, allowedIds });
      } else {
        accResolved.push(restAction);
      }
      return Promise.resolve(accResolved);
    }, Promise.resolve([] as OutputModelAction));
  } else {
    return actions?.map((action) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { canExecute, ...restAction } = action;
      return restAction;
    });
  }
};

export const getRawData = async <M extends Prisma.ModelName>({
  models,
  prisma,
  resource,
  resourceIds,
  maxDepth = 2,
}: {
  models: readonly Prisma.DMMF.Model[];
  prisma: PrismaClient;
  resource: M;
  resourceIds: Array<string | number>;
  maxDepth?: number;
}): Promise<Model<M>[]> => {
  const modelDMMF = getPrismaModelForResource(models, resource);

  const include = includeDataByDepth(models, modelDMMF!, 1, maxDepth);

  // @ts-expect-error - kl
  const data = await prisma[resource].findMany({
    where: { id: { in: resourceIds } },
    include,
  });

  return data;
};
