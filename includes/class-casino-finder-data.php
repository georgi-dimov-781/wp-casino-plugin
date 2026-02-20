<?php
/**
 * Casino data and quiz configuration.
 */
class Casino_Finder_Data {

    /**
     * Get quiz step definitions.
     */
    public static function get_steps() {
        return array(
            array(
                'id'       => 'casino-type',
                'title'    => 'Type of Casino',
                'question' => 'What type of casino are you looking for?',
                'options'  => array(
                    array( 'label' => 'Online Casino', 'value' => 'online',       'icon' => '🎰' ),
                    array( 'label' => 'Sweepstakes',   'value' => 'sweepstakes',  'icon' => '🎟️' ),
                    array( 'label' => 'Social Casino', 'value' => 'social',       'icon' => '👥' ),
                    array( 'label' => 'No Deposit',    'value' => 'no-deposit',   'icon' => '🎁' ),
                    array( 'label' => 'Fast Paying',   'value' => 'fast-paying',  'icon' => '⚡' ),
                ),
            ),
            array(
                'id'       => 'game',
                'title'    => 'Preferred Game',
                'question' => 'What type of game do you prefer?',
                'options'  => array(
                    array( 'label' => 'Slots',       'value' => 'slots',       'icon' => '🎰' ),
                    array( 'label' => 'Blackjack',   'value' => 'blackjack',   'icon' => '🃏' ),
                    array( 'label' => 'Live Dealer', 'value' => 'live-dealer', 'icon' => '🎥' ),
                    array( 'label' => 'Table Games', 'value' => 'table-games', 'icon' => '🎲' ),
                ),
            ),
            array(
                'id'       => 'banking',
                'title'    => 'Deposit Method',
                'question' => 'What is your preferred deposit method?',
                'options'  => array(
                    array( 'label' => 'Credit Card',           'value' => 'credit-card',   'icon' => '💳' ),
                    array( 'label' => 'PayPal',                'value' => 'paypal',         'icon' => '🅿️' ),
                    array( 'label' => 'Crypto',                'value' => 'crypto',         'icon' => '₿' ),
                    array( 'label' => 'Apple Pay / Google Pay', 'value' => 'mobile-wallet', 'icon' => '📱' ),
                ),
            ),
            array(
                'id'       => 'payout',
                'title'    => 'Payout Speed',
                'question' => 'How fast do you want your payouts?',
                'options'  => array(
                    array( 'label' => 'Instant',      'value' => 'instant',       'icon' => '⚡' ),
                    array( 'label' => '1–2 Days',     'value' => '1-2-days',      'icon' => '🕐' ),
                    array( 'label' => 'Up to 1 Week', 'value' => 'up-to-1-week',  'icon' => '📅' ),
                ),
            ),
        );
    }
}
