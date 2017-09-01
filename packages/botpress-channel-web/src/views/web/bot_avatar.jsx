import style from './style.scss'

const BotAvatar = props => {

  const color = props.foregroundColor || '#A029D3'

  return <i>
    <svg viewBox="0 0 254 252" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fill-rule="evenodd">
        <path d="M127 252c69.036 0 125-55.964 125-125S196.036 2 127 2 2 57.964 2 127s55.964 125 125 125z" className={style.color} fill={color}></path>
        <path d="M175.217 244.042c45.946-18.958 78.283-64.196 78.283-116.986 0-69.864-56.636-126.5-126.5-126.5S.5 57.192.5 127.056c0 52.898 32.469 98.212 78.564 117.101 5.747-18.068 21.627-31.698 41.055-34.382v-9.935h-71.37c-4.652 0-8.402-3.714-8.402-8.296V95.308c0-4.575 3.758-8.297 8.393-8.297h64.464V73.472h13.66V50.136c-5.305-1.859-9.106-6.874-9.106-12.77 0-7.477 6.116-13.539 13.66-13.539 7.545 0 13.661 6.062 13.661 13.54 0 5.895-3.801 10.91-9.107 12.769v23.336h13.66v13.54h59.895c4.64 0 8.41 3.714 8.41 8.296v96.236c0 4.574-3.762 8.296-8.402 8.296h-74.46v10.064c18.988 2.96 34.451 16.4 40.142 34.138z" fill="#FFF" opacity=".85"></path>
        <rect fill="#FFF" x="64.365" y="114.515" width="130.488" height="40.691" rx="10"></rect>
        <ellipse className={style.color} fill={color} opacity=".5" cx="92.283" cy="135.674" rx="14.78" ry="14.649"></ellipse>
        <ellipse className={style.color} fill={color} opacity=".5" cx="162.897" cy="135.674" rx="14.78" ry="14.649"></ellipse>
        <ellipse fill="#000" opacity=".6" cx="92.283" cy="135.674" rx="14.78" ry="14.649"></ellipse>
        <ellipse fill="#000" opacity=".6" cx="162.897" cy="135.674" rx="14.78" ry="14.649"></ellipse>
      </g>
    </svg>
  </i>
}

export default BotAvatar
