<?php
/**
 * Shortcode registration and rendering.
 */
class Casino_Finder_Shortcode {

    /**
     * Instance counter for unique IDs when multiple shortcodes appear on one page.
     */
    private static $instance_count = 0;

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

        self::$instance_count++;
        $instance_id = 'casino-finder-' . self::$instance_count;

        ob_start();
        include CF_PATH . 'templates/quiz.php';
        return ob_get_clean();
    }
}
