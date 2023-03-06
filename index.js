import fs from 'fs/promises'
import { Parser } from '@json2csv/plainjs'
import { dirname, join } from 'path'

const inputFile = process.argv[2]

async function convertToJson(inputFile) {
    const jsonData = await fs.readFile(inputFile, 'utf-8')
    return JSON.parse(jsonData)
}

async function convertToCsv(inputFile) {
    const data = await convertToJson(inputFile)

    const dimensionFields = data.dimensionHeaders.map((header) => header.name)

    const rows = data.rows.map((row) => ({
        ...Object.fromEntries(
            row.dimensionValues.map((value, index) => [dimensionFields[index], value.value]),
        ),
        ...Object.fromEntries(
            row.metricValues.map((value, index) => [
                data.metricHeaders[index].name,
                value.value,
            ]),
        ),
    }))

    const json2csvParser = new Parser()
    return json2csvParser.parse(rows)
}

async function writeFile() {
    const fileName = `${inputFile.split('.')[inputFile.split('.').length - 2]}.csv`
    const outputFile = join(dirname(inputFile), fileName)
    const csv = await convertToCsv(inputFile)
    await fs.writeFile(outputFile, csv)
    console.log(`CSV file successfully created: ${outputFile}`)
}

writeFile()
