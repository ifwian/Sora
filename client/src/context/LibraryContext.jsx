import { LibraryContext } from './library-context'
import { useResource } from '../hooks/useResource'
import { createResourceService } from '../services/resourceService'

const gameService = createResourceService('/library/games')
const bookService = createResourceService('/library/books')
const movieService = createResourceService('/library/movies')

/** LibraryProvider — games, books, and movies/series. */
export function LibraryProvider({ children }) {
  const games = useResource(gameService)
  const books = useResource(bookService)
  const movies = useResource(movieService)

  return <LibraryContext.Provider value={{ games, books, movies }}>{children}</LibraryContext.Provider>
}
