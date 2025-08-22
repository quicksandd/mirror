/**
 * Remove unwanted enumeration/bullet prefixes from list items while preserving real content.
 */
export function cleanListItems(root=document){
  const lists = root.querySelectorAll('ul, ol')
  lists.forEach(list=>{
    list.querySelectorAll('li').forEach(item=>{
      const original = item.textContent || item.innerText || ''
      let text = original
      text = text.replace(/^[\d]+\.\s+/, '')        // "1. "
      text = text.replace(/^[•·▪▫]\s+/, '')           // bullets
      text = text.replace(/^[-–—]\s+/, '')            // dashes
      text = text.replace(/^[a-zA-Z]\)\s+/, '')      // "a) "
      text = text.replace(/^[а-яА-Я]\)\s+/, '')      // "а) "
      text = text.replace(/^[\d]+\)\s+/, '')        // "1) "
      text = text.replace(/^[a-zA-Z]\.\s+/, '')      // "a. "
      text = text.replace(/^[а-яА-Я]\.\s+/, '')      // "а. "
      text = text.replace(/^\s+|\s+$/g, '')
      text = text.replace(/\s+/g, ' ')
      if (text && text !== original){
        item.textContent = text
      }
    })
  })
}
