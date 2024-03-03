'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import { LogIn } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useModal } from 'connectkit'

import {
  useLogin,
  useLogout,
  useProfiles,
  useSession
} from '@lens-protocol/react-web'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'
import Link from 'next/link'

export function Nav() {
  const { execute: logoutLens } = useLogout()
  const { address, isConnected } = useAccount()
  const { disconnectAsync } = useDisconnect()
  const { setOpen } = useModal()
  const [isClient, setIsClient] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const { connectAsync } = useConnect({
    connector: new InjectedConnector(),
  })

  async function connectWallet() {
    try {
      setOpen(true)
    } catch (err) {
      console.log('error:', err)
      setOpen(false)
    }
  }

  async function logout() {
    try {
      await logoutLens()
      await disconnectAsync()
      router.push('/')
    } catch (err) {
      console.log('error:', err)
    }
  }

  return (
    <nav className='border-b p-4 pl-10 flex sm:flex-row sm:items-center flex-col'>
      <div className='flex flex-1 flex-row'>
        <Link href='/'>
          <h1 className='text-gray'>
            <span className='font-bold'>Lens</span>
            Protocol
          </h1>
        </Link>
        {
         isClient && isConnected && session && session.type === "WITH_PROFILE" && (
            <Link href='/profile'>
              <p className='ml-4 text-muted-foreground'>Profile</p>
            </Link>
          )
        }
        <Link href='/publications'>
          <p className='ml-4 text-muted-foreground'>Publications</p>
        </Link>
      </div>
      <div className='sm:hidden mt-3'>
        {
          isClient && !address && (
            <Button variant='outline' className='mr-3' onClick={connectWallet}>
              <LogIn className='mr-2' />
              Connect Wallet
            </Button>
          ) 
        }
        <ModeToggle />
      </div>
      <div className='mr-4 sm:flex items-center hidden '>
        {
           isClient && !address && (
            <Button variant='outline' className='mr-3' onClick={connectWallet}>
              <LogIn className='mr-2' />
              Connect Wallet
            </Button>
          )
        }
        {
          isClient && session && session.type !== "WITH_PROFILE" && address && (
            <LoginButton
              address={address}
              isConnected={isConnected}
              disconnectAsync={disconnectAsync}
              connectAsync={connectAsync}
            />
          )
        }
        {
          isClient && session && session.type === "WITH_PROFILE" &&  isConnected && (
            <Button variant='outline' className='mr-3' onClick={logout}>
              <LogIn className='mr-2' />
              Sign Out.
            </Button>
          )
        }
        <ModeToggle />
      </div>
    </nav>
  )
}

function LoginButton({
  address, isConnected, disconnectAsync, connectAsync
}) {
  const { execute: login } = useLogin()
  const { data: profiles } = useProfiles({
    where: {
      ownedBy: [address]
    }
  })
  let profile = profiles?.length ? profiles[profiles?.length - 1] : null

  const onLoginClick = async () => {
    if (!profile) return
    if (isConnected) {
      await disconnectAsync()
    }

    const { connector } = await connectAsync()
    if (connector instanceof InjectedConnector) {
      const walletClient = await connector.getWalletClient()
      await login({
        address: walletClient.account.address,
        profileId: profile.id
      })
    }
  }
  return (
    <Button variant='outline' className='mr-3' onClick={onLoginClick}>
      <LogIn className='mr-2' />
      Sign in with Lens.
    </Button>
  )
}
