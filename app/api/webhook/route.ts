import { Webhook } from 'svix'
//import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.action'

export async function POST(req: Request) {
  console.log("🔹 Вебхук получен!", new Date().toISOString());
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    console.error("⛔ ОШИБКА: Не найден SIGNING_SECRET");
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  const svix_id = req.headers.get('svix-id');
  const svix_timestamp = req.headers.get('svix-timestamp');
  const svix_signature = req.headers.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("⛔ ОШИБКА: Отсутствуют заголовки Svix");
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload);
  console.log("🔹 Тело вебхука:", JSON.stringify(payload, null, 2));

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }
  console.log("✅ Верификация прошла! Event:", evt.type);


  const eventType = evt.type;

  if(eventType === 'user.created') {
    const { id, email_addresses, image_url, username, first_name, last_name } = evt.data;
    const mongoUser = await createUser({
        clerkId: id,
        name: `${first_name}${last_name ? `${last_name}` : ''}`,
        username: username || email_addresses[0].email_address.split("@")[0],
        email: email_addresses[0].email_address,
        picture: image_url,
    });
    return NextResponse.json({message: 'OK', user: mongoUser})
  } 

  if(eventType === 'user.updated') {
    const { id, email_addresses, image_url, first_name, last_name } = evt.data;
    const mongoUser = await updateUser({
        clerkId: id,
        updateData: {
            name: `${first_name}${last_name ? `${last_name}` : ''}`,
            email: email_addresses[0].email_address,
            picture: image_url,
        },
        path: `/profile/${id}`
    });
    return NextResponse.json({message: 'OK', user: mongoUser})
  }
  if(eventType === 'user.deleted') {
    const {id} = evt.data;
    const deletedUser = await deleteUser({
        clerkId: id!,
    })
    return NextResponse.json({message: 'OK', user: deletedUser})
  }

  return new Response('Webhook received', { status: 200 })
}