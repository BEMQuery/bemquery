require( 'bemquery-package-boilerplate/package.json' );

var fs = require( 'fs' ),
	url = 'https://tonicdev.io' + process.env.TONIC_ENDPOINT_PATH;

exports.tonicEndpoint = function( request, response ) {
	response.end( fs.readFileSync( require.resolve( 'bemquery-package-boilerplate' ) ) );
};

`<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8">
			<title>Tonic Example</title>
		</head>
		<body>
			<p>Example</p>
			
			<script src="${url}"></script>
			<script>

			</script>
		</body>
	</html>`;
