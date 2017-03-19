require('dotenv').config()
const Client = require('coinbase').Client
const inquirer = require('inquirer')

const apiKeys = {
  'apiKey': process.env.COINBASE_API_KEY,
  'apiSecret': process.env.COINBASE_API_SECRET,
}

const client = new Client(apiKeys)

client.getPaymentMethods(null, (err, pms) => {
  const paymentMethods = pms.map(pm => pm.name)

  const paymentMethodQuestion = {
    type: 'list',
    name: 'paymentMethod',
    message: 'Which payment method would you like to use?',
    choices: paymentMethods,
  }

  const amountQuestion = {
    type: 'input',
    name: 'amount',
    message: 'How much bitcoin do you want to buy in USD? e.g., 4.20',
  }

  const questions = [paymentMethodQuestion, amountQuestion]

  inquirer.prompt(questions).then(answers => {
    const { paymentMethod, amount } = answers;

    const paymentMethodId = pms.find(p => p.name == paymentMethod).id

    client.getAccounts({}, (err, accounts) => {
      accounts.map((acct) => {
        const accountId = acct.id

        client.getAccount(accountId, (err, account) => {
          const order = {
            amount: amount,
            currency: "USD",
            payment_method: paymentMethodId,
          }

          account.buy(order, (err, tx) => {
            if (err) {
              return console.log(err)
            }

            console.log('Success!')
          })
        })
      })
    }) // TODO: address nesting issue
  })
})
