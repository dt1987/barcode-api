const express = require( 'express' );
const bodyParser = require( 'body-parser' );
const bwipjs = require( 'bwip-js' );

const app = express();
const PORT = process.env.PORT || 3030;

app.use( bodyParser.urlencoded( { extended: true } ) );

app.get( '/', ( req, res ) => {
    res.send(
        `<form action="/generate" method="post">
            <label for="values">Enter comma-separated values:</label>
            <input type="text" id="values" name="values">
            <input type="submit" value="Generate Barcodes">
        </form>`
    );
} );

function generateBarcode( value ) {
    return new Promise( ( resolve, reject ) => {
        bwipjs.toBuffer( {
            bcid: 'code128',
            text: value.trim(),
            scale: 3,
            height: 10,
            includetext: true,
            textalign: 'center',
        }, ( err, png ) => {
            if ( err ) {
                reject( err );
            } else {
                resolve( png.toString( 'base64' ) );
            }
        } );
    } );
}
app.post( '/generate', async ( req, res ) => {
    const values = req.body.values.split( ',' );

    try {
        const barcodes = await Promise.all( values.map( value => generateBarcode( value ) ) );

        res.send( `
        ${ barcodes.map( barcode => `<img src="data:image/png;base64,${ barcode }" alt="Barcode">` ).join( '' ) }
        `);
    } catch ( error ) {
        res.status( 500 ).send( `Error generating barcodes.` );
    }
} );

app.listen( PORT, () => {
    console.log( `Server started on http://localhost:${ PORT }` );
} );