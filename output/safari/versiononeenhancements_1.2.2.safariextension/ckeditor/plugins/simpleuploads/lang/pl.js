CKEDITOR.plugins.setLang( 'simpleuploads', 'pl',
	{
		// Tooltip for the "add file" toolbar button
		addFile    : 'Dodanie pliku',
		// Tooltip for the "add image" toolbar button
		addImage: 'Dodanie obrazka',

		// The server returned a URL after the upload that it's wrong
		badUrl: 'Failed to load the image with the provided URL',

		// Generic error for http status codes. Specific ones can be defined as 'httpStatus400', etc...
		errorPostFile: 'Error posting the file to %0\r\nResponse status:',

		// File size is over config.simpleuploads_maxFileSize OR the server returns HTTP status 413
		fileTooBig : 'Wybrany plik jest zbyt duży. Proszę wybierz mniejszy plik.',

		// The height of the image is over the allowed maximum
		imageTooTall: 'The image is too tall',

		// The width of the image is over the allowed maximum
		imageTooWide: 'The image is too wide',

		// The extension matches one of the blacklisted ones in config.simpleuploads_invalidExtensions
		invalidExtension : 'Nieprawidłowy typ pliku. Proszę wybrać plik o dopuszczalnym typie.',

		// The extension isn't included in config.simpleuploads_acceptedExtensions
		nonAcceptedExtension: 'Nieprawidłowy typ pliku. Proszę wybrać plik o dopuszczalnym typie:\r\n%0',

		// The file isn't an accepted type for images
		nonImageExtension: 'Musisz wybrać zdjęcie',

		// Shown after the data has been sent to the server and we're waiting for the response
		processing: 'Wczytuję...',

		// images with webkit-fake-url can't be read
		uselessSafari: 'Sorry, the images pasted with Safari aren\'t usable',

		// Error in the XHR upload. I'm not sure under which conditions this could happen, but it's a safety check
		xhrError: 'Error posting the file to %0'
	}
);
