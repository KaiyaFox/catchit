import Link from "next/link";

const SOL_TIP = process.env.NEXT_PUBLIC_SOLANA_TIP_WALLET;
const BTC_TIP = process.env.NEXT_PUBLIC_BTC_TIP_WALLET;

export default function Footer() {
    return (
    <footer className="absolute bottom-0 w-full mb-7 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>&copy; 2025 Catchit Inc. | All rights reserved. (Sort of jorking it.)</p>
        <p><Link href="https://github.com/OokamiKitsune/catchit">GitHub</Link></p>
        <p>Tip Jar:
            <br>
            </br>
            SOLANA: {SOL_TIP} <br></br> BITCOIN: {BTC_TIP}
        </p>
    </footer>

)
}