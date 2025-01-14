const { getDeployments } = require('../utils/deployment')
const validateAddress = require('../utils/validateAddress')

task('setParameter', 'Set a ConfigurationManager parameter')
  .addPositionalParam('parameter', 'Parameter name')
  .addPositionalParam('value', 'New value')
  .addOptionalParam('configuration', 'An address of a deployed ConfigurationManager, defaults to current `deployments` json file')
  .addFlag('quiet', 'makes the process less verbose')
  .addFlag('noUpdate', 'Specifies if the param change should trigger update on dependent contract, defaults to true')
  .setAction(async ({ configuration, parameter, value, quiet, noUpdate }, bre) => {
    if (!configuration) {
      const deployment = getDeployments()
      configuration = deployment.ConfigurationManager
    }

    validateAddress(configuration, 'configuration')

    const configurationManager = await ethers.getContractAt('ConfigurationManager', configuration)

    const parameterName = ethers.utils.formatBytes32String(parameter)
    const parameterValue = ethers.BigNumber.from(value)
    const currentValue = (await configurationManager.getParameter(parameterName)).toString()

    !quiet && console.log(`Setting ConfigurationManager(${configurationManager.address})\nParameter: ${parameter}\nValue: ${currentValue} → ${value}`)

    const tx = await configurationManager.setParameter(parameterName, parameterValue)
    const txReceipt = await tx.wait()
    !quiet && console.log(`Done! Transaction hash: ${txReceipt.transactionHash}`)

    if (!noUpdate) {
      let updateTx, updateReceipt

      switch (parameter) {
        case 'MIN_UPDATE_INTERVAL':
          const priceProvider = await ethers.getContractAt('PriceProvider', await configurationManager.getPriceProvider())
          if (priceProvider.address === ethers.constants.AddressZero) {
            throw new Error(`PriceProvider not set on ConfigurationManager(${configurationManager.address})`)
          }
          !quiet && console.log(`Updating PriceProvider(${priceProvider.address})`)
          updateTx = await priceProvider.updateMinUpdateInterval()
          updateReceipt = await updateTx.wait()
          !quiet && console.log(`Done! Transaction hash: ${updateReceipt.transactionHash}`)
          break
        case 'GUESSER_ACCEPTABLE_RANGE':
          const ivGuesser = await ethers.getContractAt('IVGuesser', await configurationManager.getIVGuesser())
          if (ivGuesser.address === ethers.constants.AddressZero) {
            throw new Error(`IVGuesser not set on ConfigurationManager(${configurationManager.address})`)
          }
          !quiet && console.log(`Updating IVGuesser(${ivGuesser.address})`)
          updateTx = await ivGuesser.updateAcceptableRange()
          updateReceipt = await updateTx.wait()
          !quiet && console.log(`Done! Transaction hash: ${updateReceipt.transactionHash}`)
          break
      }
    }
  })
