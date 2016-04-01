CKEDITOR.plugins.setLang( 'simpleuploads', 'de',
	{
		// Tooltip for the "add file" toolbar button
		addFile    : 'Datei hinzufügen',
		// Tooltip for the "add image" toolbar button
		addImage: 'Bild hinzufügen',

		// The server returned a URL after the upload that it's wrong
		badUrl: 'Failed to load the image with the provided URL',

		// Generic error for http status codes. Specific ones can be defined as 'httpStatus400', etc...
		errorPostFile: 'Error posting the file to %0\r\nResponse status:',

		// File size is over config.simpleuploads_maxFileSize OR the server returns HTTP status 413
		fileTooBig : 'Die Datei ist zu groß. Versuchen Sie bitte eine kleinere Datei hochzuladen.',

		// The height of the image is over the allowed maximum
		imageTooTall: 'Das Bild ist nicht hoch genug',
		
		// The width of the image is over the allowed maximum
		imageTooWide: 'Das Bild ist zu breit',

		// The extension matches one of the blacklisted ones in config.simpleuploads_invalidExtensions
		invalidExtension : 'Die ausgewählte Datei ist nicht zugelassen. Bitte lade nur zugelassene Dateien hoch.',

		// The extension isn't included in config.simpleuploads_acceptedExtensions
		nonAcceptedExtension: 'Die ausgewählte Datei ist nicht zugelassen. Bitte lade nur zugelassene Dateien hoch:\r\n%0',

		// The file isn't an accepted type for images
		nonImageExtension: 'Sie müssen ein Bild auswählen',

		// Shown after the data has been sent to the server and we're waiting for the response
		processing: 'Wird geladen...',

		// images with webkit-fake-url can't be read
		uselessSafari: 'Sorry, the images pasted with Safari aren\'t usable',

		// Error in the XHR upload. I'm not sure under which conditions this could happen, but it's a safety check
		xhrError: 'Error posting the file to %0'
    }
);