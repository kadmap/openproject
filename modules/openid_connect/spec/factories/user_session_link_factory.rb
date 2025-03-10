# frozen_string_literal: true

FactoryBot.define do
  factory :user_session_link, class: "OpenIDConnect::UserSessionLink" do
    session { nil }
    oidc_session { "foobar" }
  end
end
