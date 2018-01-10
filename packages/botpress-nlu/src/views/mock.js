const hello = {
  intents: [
    {
      name: 'greetings',
      content:
`- Hello
- Hi!
- Hey there
- Bonjour
- Good day`
    },
    {
      name: 'cancel',
      content:
`- nevermind
- cancel
- forget about [this][destination]

[destination]: @native.city`
    }
  ],

  entities: []
}

export default hello
