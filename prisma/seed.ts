import { BandStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.image.deleteMany();
  await prisma.member.deleteMany();
  await prisma.album.deleteMany();
  await prisma.band.deleteMany();

  await prisma.band.create({
    data: {
      name: "Gjurma e Natës",
      slug: "gjurma-e-nates",
      city: "Prishtinë",
      yearFounded: 2008,
      status: BandStatus.ACTIVE,
      genres: ["Indie Rock", "Post-Punk"],
      youtubeUrl: "https://www.youtube.com/",
      spotifyUrl: "https://open.spotify.com/",
      instagramUrl: "https://www.instagram.com/",
      biography:
        "Formed in Prishtinë in 2008, Gjurma e Natës blends post-punk textures with Balkan lyrical storytelling and became known for independent releases and live community events.",
      albums: {
        create: [
          {
            title: "Asfalt i Ftohtë",
            releaseYear: 2012,
            description: "Debut full-length album recorded in a home studio collective.",
          },
          {
            title: "Qyteti pa Gjurmë",
            releaseYear: 2019,
            description: "A darker record with ambient experimentation.",
          },
        ],
      },
      members: {
        create: [
          { name: "Arbër K.", role: "Vocals", yearsActive: "2008-present" },
          { name: "Lira M.", role: "Guitar", yearsActive: "2011-present" },
          { name: "Dren P.", role: "Drums", yearsActive: "2008-2016" },
        ],
      },
      images: {
        create: [
          {
            imageUrl:
              "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
            caption: "Live performance in Prishtinë",
          },
        ],
      },
    },
  });

  await prisma.band.create({
    data: {
      name: "Muri i Zhurmës",
      slug: "muri-i-zhurmes",
      city: "Prizren",
      yearFounded: 1999,
      status: BandStatus.INACTIVE,
      genres: ["Metal", "Hardcore"],
      youtubeUrl: "https://www.youtube.com/",
      biography:
        "Muri i Zhurmës emerged from late-90s underground spaces in Prizren and helped shape the local heavy scene through DIY recordings and regional tours.",
      albums: {
        create: [
          {
            title: "Nën Beton",
            releaseYear: 2003,
            description: "Raw debut album released independently on CD.",
          },
        ],
      },
      members: {
        create: [
          { name: "Visar H.", role: "Bass", yearsActive: "1999-2008" },
          { name: "Leart B.", role: "Vocals", yearsActive: "1999-2010" },
        ],
      },
      images: {
        create: [
          {
            imageUrl:
              "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
            caption: "Archive photo from a local venue",
          },
        ],
      },
    },
  });

  await prisma.band.create({
    data: {
      name: "Kafaz Eksperimental",
      slug: "kafaz-eksperimental",
      city: "Pejë",
      yearFounded: 2016,
      status: BandStatus.ACTIVE,
      genres: ["Experimental", "Noise Rock"],
      spotifyUrl: "https://open.spotify.com/",
      biography:
        "Kafaz Eksperimental is a rotating collective in Pejë focused on improvisational performance, tape-loop installations, and independent publishing.",
      albums: {
        create: [
          {
            title: "Arkivi i Tingullit",
            releaseYear: 2021,
            description: "An archival concept album based on field recordings.",
          },
        ],
      },
      members: {
        create: [
          { name: "Era N.", role: "Synth / Electronics", yearsActive: "2016-present" },
          { name: "Mentor D.", role: "Guitar", yearsActive: "2018-present" },
        ],
      },
      images: {
        create: [
          {
            imageUrl:
              "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80",
            caption: "Experimental set with analog equipment",
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });