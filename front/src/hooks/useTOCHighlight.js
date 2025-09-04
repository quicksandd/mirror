import { useEffect } from 'react'

/**
 * Highlights the current section in a given TOC container based on scroll position.
 * @param {string} tocSelector CSS selector for TOC links container
 * @param {number} offset pixels threshold above header
 */
export function useTOCHighlight(tocSelector='.wiki-tools', offset=100){
  useEffect(()=>{
    const onScroll = ()=>{
      const headers = document.querySelectorAll('h1, h2, h3')
      const tocLinks = document.querySelectorAll(`${tocSelector} a[href^="#"]`)
      tocLinks.forEach(l=>l.classList.remove('active'))
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      let current = null
      for (let i=0;i<headers.length;i++){
        const h = headers[i]
        const top = h.offsetTop
        if (scrollTop >= top - offset) current = h
        else break
      }
      if (current && current.id){
        const link = document.querySelector(`${tocSelector} a[href="#${current.id}"]`)
        if (link) link.classList.add('active')
      }
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    const t1 = setTimeout(onScroll, 500)
    return ()=>{
      window.removeEventListener('scroll', onScroll)
      clearTimeout(t1)
    }
  }, [tocSelector, offset])
}
