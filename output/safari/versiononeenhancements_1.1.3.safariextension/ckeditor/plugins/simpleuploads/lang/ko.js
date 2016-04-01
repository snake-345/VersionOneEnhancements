CKEDITOR.plugins.setLang( 'simpleuploads', 'ko',
	{
		// Tooltip for the "add file" toolbar button
		addFile : '파일 추가',
		// Tooltip for the "add image" toolbar button
		addImage: '이미지 추가',

		// The server returned a URL after the upload that it's wrong
		badUrl: 'Failed to load the image with the provided URL',

		// Generic error for http status codes. Specific ones can be defined as 'httpStatus400', etc...
		errorPostFile: 'Error posting the file to %0\r\nResponse status:',

		// File size is over config.simpleuploads_maxFileSize OR the server returns HTTP status 413
		fileTooBig : '파일이 너무 큽니다. 보다 작은 파일을 사용하십시오.',

		// The height of the image is over the allowed maximum
		imageTooTall: 'The image is too tall',

		// The width of the image is over the allowed maximum
		imageTooWide: 'The image is too wide',

		// The extension matches one of the blacklisted ones in config.simpleuploads_invalidExtensions
		invalidExtension : '잘못된 파일 유형입니다. 올바른 파일만 사용하십시오.',

		// The extension isn't included in config.simpleuploads_acceptedExtensions
		nonAcceptedExtension: '파일 유형이 올바르지 않습니다. 올바른 파일만 사용하십시오.\r\n%0',


		// The file isn't an accepted type for images
		nonImageExtension: 'You must select an image',

		// Shown after the data has been sent to the server and we're waiting for the response
		processing: '처리 중...',

		// images with webkit-fake-url can't be read
		uselessSafari: 'Sorry, the images pasted with Safari aren\'t usable',

		// Error in the XHR upload. I'm not sure under which conditions this could happen, but it's a safety check
		xhrError: 'Error posting the file to %0'
	}
);
