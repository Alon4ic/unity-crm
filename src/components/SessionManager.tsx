'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase/client'

export function SessionManager({ salePageId }: { salePageId: string }) {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from('manager_sessions')
        .select('*')
        .eq('sale_page_id', salePageId)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!error) setSession(data)
      setLoading(false)
    }

    fetchSession()
  }, [salePageId])

  const startSession = async () => {
    const { data, error } = await supabase.from('manager_sessions').insert({
      sale_page_id: salePageId,
    }).select().single()

    if (!error) setSession(data)
  }

  const endSession = async () => {
    if (!session) return

    const { data, error } = await supabase
      .from('manager_sessions')
      .update({ end_time: new Date().toISOString() })
      .eq('id', session.id)
      .select()
      .single()

    if (!error) setSession(data)
  }

  if (loading) return <div>Загрузка...</div>

  return (
    <div className="p-4 border rounded-md space-y-2">
      <h2 className="text-lg font-bold">Смена менеджера</h2>

      {session && !session.end_time ? (
        <>
          <p>Смена началась: {format(new Date(session.start_time), 'dd.MM.yyyy HH:mm')}</p>
          <Button onClick={endSession}>Завершить смену</Button>
        </>
      ) : (
        <Button onClick={startSession}>Начать смену</Button>
      )}
    </div>
  )
}
