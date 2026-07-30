/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/novo` | `/novo`; params?: Router.UnknownInputParams; } | { pathname: `/laudo/[id]`, params: Router.UnknownInputParams & { id: string | number; } } | { pathname: `/laudo/[id]/editar`, params: Router.UnknownInputParams & { id: string | number; } };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownOutputParams; } | { pathname: `${'/(tabs)'}/novo` | `/novo`; params?: Router.UnknownOutputParams; } | { pathname: `/laudo/[id]`, params: Router.UnknownOutputParams & { id: string; } } | { pathname: `/laudo/[id]/editar`, params: Router.UnknownOutputParams & { id: string; } };
      href: Router.RelativePathString | Router.ExternalPathString | `/_sitemap${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}${`?${string}` | `#${string}` | ''}` | `/${`?${string}` | `#${string}` | ''}` | `${'/(tabs)'}/novo${`?${string}` | `#${string}` | ''}` | `/novo${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}` | `/`; params?: Router.UnknownInputParams; } | { pathname: `${'/(tabs)'}/novo` | `/novo`; params?: Router.UnknownInputParams; } | `/laudo/${Router.SingleRoutePart<T>}${`?${string}` | `#${string}` | ''}` | `/laudo/${Router.SingleRoutePart<T>}/editar${`?${string}` | `#${string}` | ''}` | { pathname: `/laudo/[id]`, params: Router.UnknownInputParams & { id: string | number; } } | { pathname: `/laudo/[id]/editar`, params: Router.UnknownInputParams & { id: string | number; } };
    }
  }
}
