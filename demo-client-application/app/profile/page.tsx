'use client'

import {
  useSession
} from '@lens-protocol/react-web'
import { Profile } from '@lens-protocol/widgets-react'

export default function ProfileComponent() {
  const { data } = useSession();
  if (!data) return null
  return (
    <div className="px-10 py-14 flex flex-col items-center">
      {
        data.type === "WITH_PROFILE" && data.profile && (
          <Profile
            handle={`${data.profile.handle?.namespace}/${data.profile.handle?.localName}`}
            followButtonBackgroundColor='black'
          />
        )
      }
    </div>
  )
}