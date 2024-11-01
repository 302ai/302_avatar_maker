import { produce } from 'immer'
import { create } from 'zustand'

import { storeMiddleware } from './middleware'

interface UserStore {
  language: string
}

interface UserActions {
  updateField: <T extends keyof UserStore>(
    field: T,
    value: UserStore[T]
  ) => void
  updateAll: (fields: Partial<UserStore>) => void
}

export const useUserStore = create<UserStore & UserActions>()(
  storeMiddleware<UserStore & UserActions>(
    (set) => ({
      language: 'en',
      updateField: (field, value) =>
        set(
          produce((state) => {
            state[field] = value
          })
        ),
      updateAll: (fields) =>
        set(
          produce((state) => {
            for (const [key, value] of Object.entries(fields)) {
              state[key as keyof UserStore] = value
            }
          })
        ),
    }),
    'user_store_videosum'
  )
)
