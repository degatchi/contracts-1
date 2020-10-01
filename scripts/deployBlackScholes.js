const bre = require('@nomiclabs/buidler')
const getContractFactoryWithLibraries = require('../test/util/getContractFactoryWithLibraries')

async function main () {
  const FixidityLib = await ethers.getContractFactory('FixidityLib')
  const fixidity = await FixidityLib.deploy()
  await fixidity.deployed()

  const LogarithmLib = await getContractFactoryWithLibraries('LogarithmLib', {
    FixidityLib: fixidity.address
  })
  const logarithm = await LogarithmLib.deploy()
  await logarithm.deployed()

  const ExponentLib = await getContractFactoryWithLibraries('ExponentLib', {
    FixidityLib: fixidity.address,
    LogarithmLib: logarithm.address
  })
  const exponent = await ExponentLib.deploy()
  await exponent.deployed()

  const NormalDistribution = await ethers.getContractFactory('NormalDistribution')
  const normalDistribution = await NormalDistribution.deploy()
  await normalDistribution.deployed()

  const BlackScholes = await getContractFactoryWithLibraries('BlackScholes', {
    FixidityLib: fixidity.address,
    LogarithmLib: logarithm.address,
    ExponentLib: exponent.address,
  })

  const bs = await BlackScholes.deploy(normalDistribution.address)
  await bs.deployed()
  console.log('BlackScholes Address: ', bs.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
