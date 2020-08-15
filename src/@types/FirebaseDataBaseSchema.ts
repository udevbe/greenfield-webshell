import type { FirebaseReducer } from 'react-redux-firebase'

export interface AppSchema {
  about: string
  icon: string
  title: string
  url: string
  type: string
}

export interface RoleGrantSchema {
  // role grant name/id
  [key: string]: boolean
}

export interface RoleSchema {
  name: string
  description: string
}

export interface UserAppByUserIdSchema {
  // app id
  [key: string]: {
    appId: string
    uid: string
  }
}

export interface FirebaseDataBaseSchema {
  // user id
  admins: boolean
  // app id
  apps: AppSchema
  // role id
  role_grants: RoleGrantSchema
  // role id
  roles: RoleSchema
  // user id
  apps_by_user_id: UserAppByUserIdSchema
  // role id
  user_roles: {
    [key: string]: boolean
  }
  // user id
  users: FirebaseReducer.AuthState
}

export type FirebaseState = FirebaseReducer.Reducer<{}, FirebaseDataBaseSchema>
