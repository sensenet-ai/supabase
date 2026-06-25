import { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import { Database } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
} from 'ui'
import { IS_PLATFORM } from '@/lib/constants'

interface DbEntry {
  name: string
  owner: string
}

const PG_META_DB_COOKIE = 'pg_meta_db'

export const DatabaseDropdown = () => {
  const [databases, setDatabases] = useState<DbEntry[]>([])
  const [current, setCurrent] = useState<string>('postgres')

  useEffect(() => {
    // read current selection from cookie
    const saved = Cookies.get(PG_META_DB_COOKIE)
    if (saved) setCurrent(saved)

    // fetch available databases from our patched postgres-meta
    fetch('/pg/databases')
      .then((r) => r.json())
      .then((dbs: DbEntry[]) => {
        // filter out internal databases
        setDatabases(dbs.filter((db) => !db.name.startsWith('_')))
      })
      .catch(() => {
        // endpoint not available (upstream meta, or platform mode)
      })
  }, [])

  // don't render on platform (they have their own project picker)
  // or if there's only one database
  if (IS_PLATFORM || databases.length <= 1) return null

  const handleSelect = (dbName: string) => {
    Cookies.set(PG_META_DB_COOKIE, dbName, { path: '/', expires: 365 })
    setCurrent(dbName)
    // reload to re-fetch all meta queries with the new database context
    window.location.reload()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          className="rounded-full"
          icon={<Database className="rotate-0" size={14} strokeWidth={1.5} />}
        >
          <span>{current}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {databases.map((db) => (
          <DropdownMenuItem
            key={db.name}
            onClick={() => handleSelect(db.name)}
            className={db.name === current ? 'bg-surface-200' : ''}
          >
            <span className="font-mono text-xs">{db.name}</span>
            <span className="ml-auto text-xs text-foreground-lighter">{db.owner}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
