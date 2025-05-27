export default function htmlFormatPlugin() {
    return {
      name: 'plugin-format',
      enforce: 'post',
      transformIndexHtml(html) {
        // Remove espaço entre </title> e <script>
        let formattedHtml = html.replace(
          /(<\/title>)\s+(<script)/g, 
          '$1$2'
        );
        
        // Remove quebra de linha entre script e link
        formattedHtml = formattedHtml.replace(
          /(<script[^>]*><\/script>)\s*\n\s*(<link[^>]*>)/g, 
          '$1$2'
        );
        
        // Remove quebra de linha entre link e </head>
        formattedHtml = formattedHtml.replace(
          /(<link[^>]*>)\s*\n\s*(<\/head>)/g,
          '$1$2'
        );
        
        return formattedHtml;
      }
    };
  }