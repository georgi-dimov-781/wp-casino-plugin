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
        ob_start();
        include CF_PATH . 'templates/quiz.php';
        return ob_get_clean();
    }
}
