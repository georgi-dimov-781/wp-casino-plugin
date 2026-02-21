<?php
/**
 * Shortcode registration and rendering.
 */
class Casino_Finder_Shortcode {

    /**
     * Register the [casino_finder] shortcode.
     */
    public static function init() {
        add_shortcode( 'casino_finder', array( __CLASS__, 'render' ) );
    }

    /**
     * Render the shortcode output.
     */
    public static function render( $atts ) {
        $atts = shortcode_atts(
            array( 'theme' => 'dark' ),
            $atts,
            'casino_finder'
        );

        $theme = sanitize_text_field( $atts['theme'] );
        if ( ! in_array( $theme, array( 'dark', 'light' ), true ) ) {
            $theme = 'dark';
        }

        $theme_class = 'light' === $theme ? ' casino-finder--light' : '';

        ob_start();
        include CF_PATH . 'templates/quiz.php';
        return ob_get_clean();
    }
}
