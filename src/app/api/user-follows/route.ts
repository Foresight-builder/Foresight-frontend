import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getUserFollows, getFollowersCount } from '@/lib/localFollowStore'

function isMissingRelation(error?: { message?: string }) {
  if (!error?.message) return false
  const msg = error.message.toLowerCase()
  return msg.includes('relation') && msg.includes('does not exist')
}
function isUserIdForeignKeyViolation(error?: { message?: string }) {
  if (!error?.message) return false
  const msg = error.message.toLowerCase()
  return msg.includes('violates foreign key constraint') && msg.includes('event_follows_user_id_fkey')
}
function isUserIdTypeIntegerError(error?: { message?: string }) {
  if (!error?.message) return false
  const msg = error.message.toLowerCase()
  return msg.includes('out of range for type integer') || msg.includes('invalid input syntax for type integer')
}

const enableFallback = process.env.ENABLE_LOCAL_FOLLOW_FALLBACK === 'true'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: '缺少用户地址参数' },
        { status: 400 }
      )
    }

    // 获取用户关注的事件ID列表（优先Supabase，失败时降级本地存储）
    const { data: followedEventIds, error: followsError } = await supabaseAdmin
      .from('event_follows')
      .select('event_id')
      .eq('user_id', address)

    let eventIds: number[] = []
    if (followsError) {
      const localRecords = await getUserFollows(address)
      eventIds = localRecords.map(r => r.event_id)
    } else {
      if (!followedEventIds || followedEventIds.length === 0) {
        return NextResponse.json({ follows: [], total: 0 })
      }
      eventIds = followedEventIds.map(follow => follow.event_id)
    }

    // 获取事件详细信息
    const { data: eventsData, error: eventsError } = await supabaseAdmin
      .from('predictions')
      .select(`
        id,
        title,
        description,
        category,
        image_url,
        deadline,
        min_stake,
        status,
        created_at
      `)
      .in('id', eventIds)
      .order('created_at', { ascending: false })

    if (eventsError) {
      return NextResponse.json(
        { error: '获取事件详细信息失败' },
        { status: 500 }
      )
    }

    // 获取每个事件的关注数（Supabase不可用时降级到本地存储）
    const eventsWithFollowersCount = await Promise.all(
      (eventsData || []).map(async (event) => {
        const { count, error: countError } = await supabaseAdmin
          .from('event_follows')
          .select('id', { count: 'exact', head: true })
          .eq('event_id', event.id)

        let followers = count || 0
        if (countError) {
          followers = await getFollowersCount(event.id)
        }

        return {
          ...event,
          followers_count: followers
        }
      })
    )

    return NextResponse.json({
      follows: eventsWithFollowersCount,
      total: eventsWithFollowersCount.length
    })

  } catch (error) {
    console.error('获取用户关注数据失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}