import { neon } from "@neondatabase/serverless";

/**
 * Seed script: creates multiple published events with cover images,
 * ticket tiers, and gallery images for the demo.
 *
 * Requires the test organizer to exist (run seed-test-user.ts first).
 * Idempotent: skips if events already exist.
 */

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  // Ensure event_images table exists
  await sql`
    CREATE TABLE IF NOT EXISTS event_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      alt TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_event_images_event ON event_images(event_id)`;

  // Get organizer
  const [organizer] = await sql`SELECT id FROM users WHERE email = 'test@eventpulse.app'`;
  if (!organizer) {
    console.error("EventPulse seed: test organizer not found. Run seed-test-user.ts first.");
    process.exit(1);
  }

  // Check if events already seeded
  const existing = await sql`SELECT count(*)::int AS n FROM events WHERE organizer_id = ${organizer.id}`;
  if (existing[0].n > 0) {
    console.log(`EventPulse: ${existing[0].n} events already exist — skipping seed.`);
    return;
  }

  const organizerId = organizer.id;

  const EVENTS = [
    {
      title: "Tech Summit 2026",
      slug: "tech-summit-2026",
      description:
        "Join 500+ developers, designers, and tech leaders for two days of talks, workshops, and networking. Featuring keynotes on AI, web performance, and the future of developer tooling.",
      location: "Warsaw Expo Center, Warsaw",
      startTime: "2026-05-15T09:00:00Z",
      endTime: "2026-05-16T18:00:00Z",
      capacity: 500,
      coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
      tiers: [
        { name: "Early Bird", priceCents: 4900, capacity: 100 },
        { name: "General Admission", priceCents: 7900, capacity: 300 },
        { name: "VIP", priceCents: 14900, capacity: 50 },
      ],
      gallery: [
        { url: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80", alt: "Conference main stage" },
        { url: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80", alt: "Speaker presenting" },
        { url: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80", alt: "Networking session" },
        { url: "https://images.unsplash.com/photo-1528901166007-3784c7dd3653?w=800&q=80", alt: "Workshop room" },
      ],
    },
    {
      title: "Jazz Night Under the Stars",
      slug: "jazz-night-stars-2026",
      description:
        "An evening of smooth jazz, craft cocktails, and gourmet bites in a candlelit garden setting. Featuring the Marcin Wasilewski Trio and special guests.",
      location: "Łazienki Park, Warsaw",
      startTime: "2026-06-20T19:00:00Z",
      endTime: "2026-06-20T23:30:00Z",
      capacity: 200,
      coverImageUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&q=80",
      tiers: [
        { name: "Standard", priceCents: 8900, capacity: 150 },
        { name: "Premium (Front Row)", priceCents: 15900, capacity: 50 },
      ],
      gallery: [
        { url: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&q=80", alt: "Jazz saxophone performance" },
        { url: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80", alt: "Candlelit outdoor venue" },
        { url: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", alt: "Live band on stage" },
      ],
    },
    {
      title: "48-Hour Hackathon: Build for Good",
      slug: "hackathon-build-for-good-2026",
      description:
        "Code for a cause! Teams of 2–5 will build solutions to real social challenges over 48 hours. Mentors from top startups, $10K in prizes, and free meals included.",
      location: "Google for Startups Campus, Warsaw",
      startTime: "2026-07-10T18:00:00Z",
      endTime: "2026-07-12T18:00:00Z",
      capacity: 150,
      coverImageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
      tiers: [
        { name: "Participant", priceCents: 0, capacity: 120 },
        { name: "Mentor Pass", priceCents: 0, capacity: 30 },
      ],
      gallery: [
        { url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80", alt: "Teams collaborating" },
        { url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80", alt: "Presentation round" },
        { url: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80", alt: "Coding session" },
        { url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80", alt: "Team brainstorming" },
        { url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80", alt: "Prize ceremony" },
      ],
    },
    {
      title: "Food & Wine Festival",
      slug: "food-wine-festival-2026",
      description:
        "Taste your way through 30+ chef stations, wine pairings, craft beer, and live cooking demos. A celebration of Polish and international cuisine.",
      location: "Stary Kleparz Market, Kraków",
      startTime: "2026-08-08T11:00:00Z",
      endTime: "2026-08-09T20:00:00Z",
      capacity: 800,
      coverImageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80",
      tiers: [
        { name: "Day Pass", priceCents: 3900, capacity: 500 },
        { name: "Weekend Pass", priceCents: 6500, capacity: 250 },
        { name: "VIP Tasting", priceCents: 12900, capacity: 50 },
      ],
      gallery: [
        { url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", alt: "Gourmet plating" },
        { url: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80", alt: "Wine tasting" },
        { url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", alt: "Chef demo station" },
      ],
    },
    {
      title: "Startup Pitch Night",
      slug: "startup-pitch-night-2026",
      description:
        "Watch 10 early-stage startups pitch to a panel of VCs and angels. Audience votes count! Networking mixer and drinks to follow.",
      location: "Campus Warsaw, Warsaw",
      startTime: "2026-05-28T18:00:00Z",
      endTime: "2026-05-28T22:00:00Z",
      capacity: 120,
      coverImageUrl: "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=1200&q=80",
      tiers: [
        { name: "Audience", priceCents: 2900, capacity: 100 },
        { name: "Investor Pass", priceCents: 0, capacity: 20 },
      ],
      gallery: [
        { url: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&q=80", alt: "Startup pitch on stage" },
        { url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80", alt: "Investor panel" },
        { url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80", alt: "Networking mixer" },
      ],
    },
    {
      title: "Outdoor Yoga & Wellness Retreat",
      slug: "yoga-wellness-retreat-2026",
      description:
        "Recharge with sunrise yoga, guided meditation, breathwork, and nutrition workshops. Set in the serene Mazury lakeside landscape.",
      location: "Mazury Lake District, Poland",
      startTime: "2026-09-05T06:00:00Z",
      endTime: "2026-09-07T14:00:00Z",
      capacity: 60,
      coverImageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",
      tiers: [
        { name: "Weekend Retreat", priceCents: 24900, capacity: 40 },
        { name: "Day Pass (Saturday)", priceCents: 9900, capacity: 20 },
      ],
      gallery: [
        { url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80", alt: "Group yoga session" },
        { url: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=80", alt: "Lakeside meditation" },
        { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80", alt: "Morning stretch class" },
      ],
    },
    {
      title: "Indie Game Expo",
      slug: "indie-game-expo-2026",
      description:
        "Play 50+ indie games before release, meet the devs, attend design talks, and compete in speed-run challenges. Cosplay welcome!",
      location: "Pałac Kultury i Nauki, Warsaw",
      startTime: "2026-10-18T10:00:00Z",
      endTime: "2026-10-19T19:00:00Z",
      capacity: 400,
      coverImageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80",
      tiers: [
        { name: "Day Pass", priceCents: 3500, capacity: 300 },
        { name: "Weekend Pass", priceCents: 5500, capacity: 80 },
        { name: "Dev Showcase", priceCents: 0, capacity: 20 },
      ],
      gallery: [
        { url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80", alt: "Gaming stations" },
        { url: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80", alt: "Game showcase booth" },
        { url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80", alt: "Cosplay competition" },
        { url: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=800&q=80", alt: "Dev panel discussion" },
      ],
    },
    {
      title: "Photography Walk: Old Town at Golden Hour",
      slug: "photo-walk-old-town-2026",
      description:
        "Capture Warsaw's Old Town in the best light. Led by award-winning photographer Anna Kowalska — tips on composition, lighting, and street photography.",
      location: "Old Town, Warsaw",
      startTime: "2026-06-14T17:30:00Z",
      endTime: "2026-06-14T20:30:00Z",
      capacity: 25,
      coverImageUrl: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&q=80",
      tiers: [
        { name: "Participant", priceCents: 4900, capacity: 25 },
      ],
      gallery: [
        { url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80", alt: "Golden hour cityscape" },
        { url: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=800&q=80", alt: "Street photography" },
        { url: "https://images.unsplash.com/photo-1554080353-a576cf803bda?w=800&q=80", alt: "Camera close-up" },
      ],
    },
  ];

  for (const ev of EVENTS) {
    // Insert event
    const [inserted] = await sql`
      INSERT INTO events (organizer_id, title, slug, description, location, start_time, end_time, capacity, status, cover_image_url)
      VALUES (${organizerId}, ${ev.title}, ${ev.slug}, ${ev.description}, ${ev.location}, ${ev.startTime}, ${ev.endTime}, ${ev.capacity}, 'published', ${ev.coverImageUrl})
      RETURNING id
    `;

    const eventId = inserted.id;

    // Insert ticket tiers
    for (const tier of ev.tiers) {
      await sql`
        INSERT INTO ticket_tiers (event_id, name, price_cents, capacity)
        VALUES (${eventId}, ${tier.name}, ${tier.priceCents}, ${tier.capacity})
      `;
    }

    // Insert gallery images
    for (let i = 0; i < ev.gallery.length; i++) {
      const img = ev.gallery[i];
      await sql`
        INSERT INTO event_images (event_id, url, alt, sort_order)
        VALUES (${eventId}, ${img.url}, ${img.alt}, ${i})
      `;
    }

    console.log(`  ✓ ${ev.title} (${ev.tiers.length} tiers, ${ev.gallery.length} gallery images)`);
  }

  console.log(`\nEventPulse: seeded ${EVENTS.length} events with gallery images.`);
}

main().catch(console.error);
