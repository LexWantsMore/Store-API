const Product = require('../models/product')

const getAllProductsStatic = async (req,res) =>{
    
    const products = await Product.find({price:{$gt:30}})
    .sort('name')
    .select('name price')
    res.status(200).json({products, nbHits:products.length})

}
const getAllProducts = async (req, res) => {
    const {featured, company, name, sort, fields, numericFilters} = req.query
    const queryObject= {}

if(featured){
    queryObject.featured = featured ==='true' ? true : false
}
if(company){
    queryObject.company = company
}
if(name){
    queryObject.name = { $regex: name, $options:'i'}
}
// (converting user friendly numeric filters to mongoose numeric filters which sits on mongodb)
if (numericFilters) {
    const operatorMap = {
        '>': '$gt', 
        '>=' :'$gte',
        '=': '$eq',
        '<': '$lt',
        '<=': '$lte',
    }
    const regEx = /\b(<|>|>=|=|<|<=)\b/g
    let filters = numericFilters.replace(regEx,(match)=>`-${operatorMap[match]}-`)
    console.log(numericFilters)
}

    

console.log(queryObject)

    let result = Product.find(queryObject)
    // sort
    if(sort) {
        const sortList = sort.split(',').join(' ');
        result = result.sort(sortList)
    }
    else{
        result = result.sort('createAt')
    }
    // fields
    if(fields){
        const fieldsList = fields.split(',').join(' ');
        result = result.select(fieldsList)

    }
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) ||10
    const skip = (page -1) * limit;

result = result.skip(skip).limit(limit)
// (23 products)(https://youtu.be/qwfE7fSVaZM?t=16907)
// (limit response to only seven items)
// (total of 4 pages,each bearing 7 items,(4pages, 7 7 7 2))
// (if we have a default page, that means it would be a page, 1 page,minus 1,multiplied by the limit,0,is zero,meaning it will be skipped.)

    const products = await result
    res.status(200).json({ products, nbHits: products.length})
}


module.exports = {
    getAllProducts,
    getAllProductsStatic,
}