( function() {
	CKEDITOR.plugins.add( 'keystrokes', {
		init: function( editor ) {
			editor.addCommand( 'h1', {
				exec: function( editor ) {
					var format = { element: 'h1' };
					var style = new CKEDITOR.style(format);
					style.apply(editor.document);
				}
			} );
			editor.addCommand( 'h2', {
				exec: function( editor ) {
					var format = { element: 'h2' };
					var style = new CKEDITOR.style(format);
					style.apply(editor.document);
				}
			} );
			editor.addCommand( 'h3', {
				exec: function( editor ) {
					var format = { element: 'h3' };
					var style = new CKEDITOR.style(format);
					style.apply(editor.document);
				}
			} );
			editor.addCommand( 'h4', {
				exec: function( editor ) {
					var format = { element: 'h4' };
					var style = new CKEDITOR.style(format);
					style.apply(editor.document);
				}
			} );
			editor.addCommand( 'h5', {
				exec: function( editor ) {
					var format = { element: 'h5' };
					var style = new CKEDITOR.style(format);
					style.apply(editor.document);
				}
			} );
			editor.addCommand( 'h6', {
				exec: function( editor ) {
					var format = { element: 'h6' };
					var style = new CKEDITOR.style(format);
					style.apply(editor.document);
				}
			} );
			editor.addCommand( 'p', {
				exec: function( editor ) {
					var format = { element: 'p' };
					var style = new CKEDITOR.style(format);
					style.apply(editor.document);
				}
			} );
			editor.setKeystroke( CKEDITOR.CTRL + 49 , 'h1' ); // CTRL + 1
			editor.setKeystroke( CKEDITOR.CTRL + 50 , 'h2' ); // CTRL + 2
			editor.setKeystroke( CKEDITOR.CTRL + 51 , 'h3' ); // CTRL + 3
			editor.setKeystroke( CKEDITOR.CTRL + 52 , 'h4' ); // CTRL + 4
			editor.setKeystroke( CKEDITOR.CTRL + 53 , 'h5' ); // CTRL + 5
			editor.setKeystroke( CKEDITOR.CTRL + 54 , 'h6' ); // CTRL + 6
			editor.setKeystroke( CKEDITOR.CTRL + 55 , 'p' ); // ALT + 7
		}
	});
} )();