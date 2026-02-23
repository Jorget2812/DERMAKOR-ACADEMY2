import { redirect } from 'next/navigation';

export default function RootPage() {
    // Redirección directa al dashboard shop real
    redirect('/fr/app/shop');
}
