'use client';


import { Container } from '@/components/Container';
import HeroSection from '@/components/HeroSection';

export default function HomePage() {


    return (
        <main className="font-playfair min-h-screen bg-white text-black dark:bg-black dark:text-white px-4 py-12">
            <Container>
                <HeroSection />
            </Container>
        </main>
    );
}
