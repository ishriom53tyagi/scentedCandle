import React, { FC } from 'react'
import { Container } from '@components/ui'
import { ArrowRight } from '@components/icons'
import s from './Hero.module.css'
import Link from 'next/link'
interface HeroProps {
  className?: string
  headline: string
}

const Hero: FC<HeroProps> = ({ headline }) => {
  return (
    <div className="bg-accent-9 border-b border-t border-accent-2">
     
        <div className={s.root}>
          <h2 style = {{ maxWidth : "100%" , paddingInline : "24px" , textAlign : "left" }}  className={s.title}>{headline}</h2>
          
        </div>
     
    </div>
  )
}

export default Hero
