// import {fetch, Response} from 'cross-fetch'
import csvParse from 'csv-parse'

const util = require('util')
const parse = util.promisify(csvParse)

export const jsonResponse = (value, init = {}) => {
    return new Response(JSON.stringify(value), {
        headers: { 'Content-Type': 'application/json', ...init.headers },
        ...init,
    })
}

export const loadFromUrl = async (url) => {
    const response = await fetch(url)
    const bodyText = await response.text()
    
    const parseOptions = { columns: true, skip_empty_lines: true }
    const records = await parse(bodyText, parseOptions)
    
    const parsed = records.map(r => {
        return {
            price: r.price,
            dix: r.dix,
            gex: r.gex,
            dateRaw: r.date,
            date: Date.parse(r.date),
        }
    })
    
    return parsed
}

const lastFiveFromLoaded = (data) => {
    const records = [...data]
    records.sort((a, b) => a.date - b.date)
    return records.slice(-5)
}

const mixinForwardReturns = (data) => {
    const records = [...data]
    records.sort((a, b) => a.date - b.date)
    
    const withForward = records.map((record, index, array) => {
        const forwards = {}
        for (let i = 1; i <= 20; i++) {
            if ((index + i) in array) {
                forwards[i] = array[index + i].price
            }
        }
        
        return {
            ...record,
            forwards,
        }
    })
    
    return withForward
}

const gexToSpxFromLoaded = (dataWithForward, duration) => {
    return dataWithForward.map(r => {
        return {
            gex: r.gex,
            forward: duration in r.forwards ? (r.forwards[duration] / r.price - 1) : null,
        }
    }).filter(r => r.forward != null)
}

export const handleGet = async (url) => {
    const data = await loadFromUrl(url)

    const dataWithForward = mixinForwardReturns(data)
    const lastFive = lastFiveFromLoaded(dataWithForward)
    const gexToSpxScatter = gexToSpxFromLoaded(dataWithForward, 1)

    return {
        lastFive,
        gexToSpxScatter,
    }
}

export const onRequestGet = async ({ env }) => {
    const now = Date.now()
    const url = `https://squeezemetrics.com/monitor/static/DIX.csv?_t=${now}`
    const result = await handleGet(url)
    return jsonResponse(result)
}
