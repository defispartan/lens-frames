'use client'

import {
  useExplorePublications, ExplorePublicationsOrderByType, LimitType
} from '@lens-protocol/react-web'

import { Publication } from '@lens-protocol/widgets-react'

export default function Search() {
  let { data: publications, loading } = useExplorePublications({
    orderBy: ExplorePublicationsOrderByType.TopCommented,
    limit: LimitType.TwentyFive
  })

  return (
    <div className="px-10 py-14 flex flex-col items-center">
      { loading && <p>Loading ...</p> }
      {
        publications?.map(publication => {
          return (
            <div style={{marginBottom: 10}} key={publication.id}>
              <Publication
                publicationId={publication.id}
              />
            </div>
          )
        })
      }
    </div>
  )
}